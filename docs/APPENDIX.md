# Appendix — Core Source Code Listings

The following listings show the most important logic in the Project Repository
system. Each snippet has been **abbreviated for brevity**: routine error
handling, logging, validation and repetitive pattern tables are omitted
(marked `// ...`), but the core algorithm in each listing is reproduced exactly
as it runs in the codebase. File paths are relative to the project root.

---

## A.1 Semantic Similarity Matching

**Use of code:** Compares a submitted topic against every stored project by
measuring the cosine similarity between their text embeddings, and returns
only the matches that score above a given threshold — the central feature of
the repository.

*File: `server/src/services/similarity.service.js`*

```javascript
export function cosineSimilarity(a, b) {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na  += a[i] * a[i];
    nb  += b[i] * b[i];
  }
  const denominator = Math.sqrt(na) * Math.sqrt(nb);
  return denominator === 0 ? 0 : dot / denominator;
}

export async function findSimilarProjects(queryText, threshold = 0.3, { mode = 'full' } = {}) {
  // Convert the user's query into a vector.
  const queryEmbedding = await embedText(queryText);
  const useTitle = mode === 'title';

  // Load every active project together with its pre-computed embeddings.
  const { rows } = await pool.query(
    `SELECT p.id, p.title, p.abstract, p.author_name, p.year,
            d.name AS department_name, p.title_embedding, p.embedding
     FROM projects p
     JOIN departments d ON d.id = p.department_id
     WHERE NOT p.is_deleted`
  );

  // Score each candidate, keep those above the threshold, sort by score.
  const scored = (await Promise.all(rows.map(async row => {
    const candidate = useTitle
      ? (row.title_embedding || await embedText(row.title))
      : (row.embedding || await embedText(`${row.title} ${row.abstract}`));
    const score = cosineSimilarity(queryEmbedding, candidate);
    return {
      projectId: row.id,
      title: row.title,
      authorName: row.author_name,
      departmentName: row.department_name,
      year: row.year,
      score: Math.round(score * 100) / 100,
    };
  })))
    .filter(r => r.score >= threshold)
    .sort((a, b) => b.score - a.score);

  return scored;
}
```

---

## A.2 Text Embedding Generation

**Use of code:** Turns a piece of text into a fixed-length normalized numeric
vector so it can be compared mathematically. It uses a MiniLM transformer
model when one is available; if the model cannot be loaded, it falls back to a
deterministic feature-hashing scheme (the "hashing trick") built from word
unigrams, bigrams and character trigrams.

*File: `server/src/services/embedding.service.js`*

```javascript
export async function embedText(text) {
  if (!embeddingPipeline) await loadEmbeddingModel();
  if (resolvedProvider === 'fallback') return embedTextFallback(text);

  // Transformer path: mean-pooled, L2-normalized output.
  const result = await embeddingPipeline(text, { pooling: 'mean', normalize: true });
  return Array.from(result.data);
}

function embedTextFallback(text) {
  const vector = new Float32Array(EMBEDDING_DIMENSION);
  const normalized = normalizeText(text);
  const words = normalized.split(/\s+/).filter(Boolean)
    .filter(word => !EMBEDDING_STOPWORDS.has(word));

  // Build weighted features: unigrams, word-bigrams, character-trigrams.
  const features = [
    ...words.map(word => ({ key: `w:${word}`, weight: 1.6 })),
    ...buildWordBigrams(words).map(f => ({ key: `b:${f}`, weight: 1.25 })),
    ...buildCharacterTrigrams(normalized).map(f => ({ key: `c:${f}`, weight: 0.45 })),
  ];

  // Project each feature into a fixed-size vector with a random sign.
  for (const feature of features) {
    const bucket = hashFeature(feature.key) % EMBEDDING_DIMENSION;
    const sign = (hashFeature(`${feature.key}:sign`) & 1) === 0 ? 1 : -1;
    vector[bucket] += feature.weight * sign;
  }

  return normalizeVector(Array.from(vector));
}
```

---

## A.3 Automatic Document Field Extraction

**Use of code:** Reads the plain text parsed from an uploaded DOCX or PDF and
heuristically identifies the project's **title**, **abstract**, **author**,
**department** and **year**, so the student only has to review — not retype —
these fields before saving.

*File: `server/src/services/fieldExtractor.service.js`*

```javascript
export function extractFields(rawText) {
  const lines = rawText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  let title = '', abstract = '', authorName = '', department = '', year = null;

  // Title = first non-noise line of reasonable length.
  for (let i = 0; i < Math.min(15, lines.length); i++) {
    const line = lines[i];
    if (line.length >= 10 && !NOISE_PATTERNS.some(p => p.test(line))) {
      title = line;
      break;
    }
  }

  // Abstract = every line between an "ABSTRACT" heading and the next heading.
  const start = lines.findIndex(l => /^\s*ABSTRACT\s*$/i.test(l));
  if (start !== -1) {
    const body = [];
    for (let i = start + 1; i < lines.length; i++) {
      if (HEADING_PATTERNS.some(p => p.test(lines[i]))) break;
      body.push(lines[i]);
    }
    abstract = body.join(' ').trim().slice(0, 2000);
  }



  return { title, abstract, authorName, department, year };
}
```

---

## A.4 User Authentication and Session Management

**Use of code:** Verifies a user's email and password, rejects deactivated
accounts, records the login, and issues a signed JWT inside an `httpOnly`
cookie that authenticates all subsequent requests for seven days. (Passwords
are stored only as salted hashes — the plain text is never compared directly
against a stored value.)

*File: `server/src/controllers/auth.controller.js`*

```javascript
export async function login(req, res, next) {
  try {
    const { email, password } = req.validated;

    const user = await findUserByEmail(email.toLowerCase());
    const valid = user && await comparePassword(password, user.password_hash);
    if (!user || !valid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    if (!user.is_active) {
      return res.status(403).json({ error: 'Account has been deactivated' });
    }

    await updateLastLogin(user.id);

    const token = signToken({ userId: user.id, email: user.email, role: user.role });
    res.cookie('token', token, {
      httpOnly: true,
      sameSite: env.cookieSameSite,
      secure: env.nodeEnv === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({
      user: { id: user.id, email: user.email, fullName: user.full_name, role: user.role },
    });
  } catch (err) {
    next(err);
  }
}
```

---

## A.5 Project Upload and Confirmation Flow

**Use of code:** Implements the two-step submission. **Step 1 (upload)**
receives a document, parses it, auto-extracts its fields, and suggests a
department — but stores nothing yet. **Step 2 (confirm)** is triggered only
after the student reviews the extracted data; it then generates **two**
embeddings (title-only, and title + abstract) so the project can be matched by
topic alone or by its full description, and persists the final record.

*File: `server/src/controllers/projects.controller.js`*

```javascript
// Step 1 — parse, extract and suggest, without persisting.
export async function uploadProject(req, res, next) {
  try {
    const text = await parseDocument(req.file.path, req.file.mimetype);
    const fields = extractFields(text);
    const departments = await listActiveDepartments();

    // If a department was detected, match it to a known one.
    let suggestedDepartmentId = null;
    if (fields.department) {
      const match = departments.find(d =>
        d.name.toLowerCase() === fields.department.toLowerCase() ||
        d.code?.toLowerCase() === fields.department.toLowerCase()
      );
      if (match) suggestedDepartmentId = match.id;
    }

    res.json({ tempFileId: req.file.filename, fields, departments, suggestedDepartmentId });
  } catch (err) {
    next(err);
  }
}

// Step 2 — embed both representations and save the project.
export async function confirmUpload(req, res, next) {
  try {
    const { tempFileId, title, abstract, authorName, departmentId, year } = req.validated;

    const titleEmbedding = await embedText(title.trim());
    const embedding = await embedText(`${title.trim()} ${abstract.trim()}`);

    const project = await createProject({
      title: title.trim(),
      abstract: abstract.trim(),
      authorName: authorName.trim(),
      departmentId,
      year,
      uploadedBy: req.user.id,
      titleEmbedding,
      embedding,
      fileName: tempFileId,
    });

    res.status(201).json({ message: 'Project uploaded successfully', project });
  } catch (err) {
    next(err);
  }
}
```
