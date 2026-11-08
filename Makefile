NPX := npx
DEPENDENCY-CRUISER := depcruise
DEPENDENCY-CRUISER-TARGET := src
DEPENDENCY-CRUISER-OPTIONS := --output-type dot
DEPENDENCY-CRUISER-IGNORE := --exclude "^src/foundation" --exclude "\.test\.ts$$"

DOT := dot
DOT-FLAGS := -Tsvg -o
DOT-PATH := dependency-graph.svg

.PHONY: dep dep-full run

dep:
	$(NPX) $(DEPENDENCY-CRUISER) $(DEPENDENCY-CRUISER-TARGET) $(DEPENDENCY-CRUISER-IGNORE) $(DEPENDENCY-CRUISER-OPTIONS) \
	| $(DOT) $(DOT-FLAGS) $(DOT-PATH)
	code $(DOT-PATH)

dep-full:
	$(NPX) $(DEPENDENCY-CRUISER) $(DEPENDENCY-CRUISER-TARGET) $(DEPENDENCY-CRUISER-OPTIONS) \
	| $(DOT) $(DOT-FLAGS) $(DOT-PATH)
	code $(DOT-PATH)

run:
	npm run dev

clean:
	powershell -NoProfile -Command "Get-ChildItem -Path src -Filter '*.js' -File -Recurse | Remove-Item -Force"