// Basic text OT (Operational Transformation) for collaborative plain-text editing.
//
// This is intentionally minimal: it supports two op types:
// - insert: {type:'insert', pos:number, text:string}
// - delete: {type:'delete', pos:number, length:number}
//
// We transform an incoming op against a concurrent op that was already applied.
// This prevents simple overwrites/position drift when users edit simultaneously.

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function isInsert(op) {
  return op && op.type === "insert";
}

function isDelete(op) {
  return op && op.type === "delete";
}

/**
 * Apply operation to text.
 * @param {string} text
 * @param {{type:'insert',pos:number,text:string}|{type:'delete',pos:number,length:number}} op
 */
function applyOp(text, op) {
  if (typeof text !== "string") text = "";

  if (isInsert(op)) {
    const pos = clamp(op.pos | 0, 0, text.length);
    const ins = String(op.text ?? "");
    return text.slice(0, pos) + ins + text.slice(pos);
  }

  if (isDelete(op)) {
    const pos = clamp(op.pos | 0, 0, text.length);
    const len = clamp(op.length | 0, 0, text.length - pos);
    return text.slice(0, pos) + text.slice(pos + len);
  }

  return text;
}

/**
 * Transform opA against opB (opB is assumed to have been applied already).
 * Returns a new opA' that can be applied after opB.
 */
function transform(opA, opB) {
  // Unknown ops: no transform.
  if (!opA || !opB) return opA;

  // Insert vs Insert
  if (isInsert(opA) && isInsert(opB)) {
    let pos = opA.pos | 0;
    const bPos = opB.pos | 0;
    const bLen = String(opB.text ?? "").length;
    // If B inserts before A, shift A right.
    // Tie-break: if same pos, keep stable ordering by shifting A as well.
    if (bPos < pos || bPos === pos) pos += bLen;
    return { ...opA, pos };
  }

  // Insert vs Delete
  if (isInsert(opA) && isDelete(opB)) {
    let pos = opA.pos | 0;
    const bPos = opB.pos | 0;
    const bLen = opB.length | 0;
    if (pos <= bPos) {
      return opA;
    }
    if (pos > bPos + bLen) {
      pos -= bLen;
      return { ...opA, pos };
    }
    // A inserts into region deleted by B => snap to start of deletion.
    return { ...opA, pos: bPos };
  }

  // Delete vs Insert
  if (isDelete(opA) && isInsert(opB)) {
    let pos = opA.pos | 0;
    let length = opA.length | 0;
    const bPos = opB.pos | 0;
    const bLen = String(opB.text ?? "").length;
    if (bPos <= pos) {
      pos += bLen;
      return { ...opA, pos };
    }
    if (bPos >= pos + length) {
      return opA;
    }
    // Insert happened inside deletion range -> deletion must expand to include inserted content.
    length += bLen;
    return { ...opA, length };
  }

  // Delete vs Delete
  if (isDelete(opA) && isDelete(opB)) {
    let pos = opA.pos | 0;
    let length = opA.length | 0;
    const bPos = opB.pos | 0;
    const bLen = opB.length | 0;

    // If B deletes entirely before A, shift A left.
    if (bPos + bLen <= pos) {
      pos -= bLen;
      return { ...opA, pos };
    }

    // If B deletes entirely after A, no change.
    if (bPos >= pos + length) {
      return opA;
    }

    // Overlap: shrink A deletion by overlap region.
    const aStart = pos;
    const aEnd = pos + length;
    const bStart = bPos;
    const bEnd = bPos + bLen;
    const overlapStart = Math.max(aStart, bStart);
    const overlapEnd = Math.min(aEnd, bEnd);
    const overlap = Math.max(0, overlapEnd - overlapStart);

    // If B starts before A, A position shifts left by deleted part before A.
    if (bStart < aStart) {
      const shift = Math.min(bLen, aStart - bStart);
      pos -= shift;
    }

    length -= overlap;
    if (length <= 0) {
      // No-op delete.
      return { ...opA, length: 0 };
    }
    return { ...opA, pos, length };
  }

  return opA;
}

module.exports = {
  applyOp,
  transform,
};