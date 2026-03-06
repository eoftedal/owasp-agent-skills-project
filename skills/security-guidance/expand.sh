#!/bin/sh

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REF_DIR="$SCRIPT_DIR/../../references"

if [ ! -d "$REF_DIR" ]; then
  echo "WARNING: Reference directory not found at $REF_DIR. No ASVS guidance index available." >&2
  exit 0
fi

find "$REF_DIR" -name '*.md' | sort | while read -r file; do
  title=$(sed -n 's/^title: *"\(.*\)"$/\1/p' "$file")
  echo "### $title"
  echo
  summary=$(sed -n 's/^summary: *"\(.*\)"$/\1/p' "$file")
  echo "$summary"
  echo
  echo "When to use:"
  awk 'BEGIN{fm=0;in_when=0} /^---$/{fm++; next} fm>1{exit} /^when_to_use:/{in_when=1; next} in_when && /^  - /{print} in_when && !/^  /{in_when=0}' "$file"
  echo
  echo "See \`$file\` for detailed guidance."
  echo
done