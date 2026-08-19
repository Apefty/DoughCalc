Recipe/preferment photos referenced by the optional `"photo"` JSON
field (rendered by `DoughCalc.renderPhoto()` in data/app.js). Accepted
extensions: jpg, jpeg, png, webp. A missing file is a silent no-op —
the "Фото" card removes itself (img.onerror) instead of showing a
broken-image icon, so it's safe to add the field to a JSON before the
actual photo file exists.
