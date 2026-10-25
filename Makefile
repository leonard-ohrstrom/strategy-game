NPX := npx
DEPENDENCY-CRUISER := depcruise
DEPENDENCY-CRUISER-TARGET := src
DEPENDENCY-CRUISER-OPTIONS := --output-type dot

DOT := dot
DOT-FLAGS := -Tsvg -o
DOT-PATH := dependency-graph.svg

.PHONY: dep run

dep:
	$(NPX) $(DEPENDENCY-CRUISER) $(DEPENDENCY-CRUISER-TARGET) $(DEPENDENCY-CRUISER-OPTIONS) \
	| $(DOT) $(DOT-FLAGS) $(DOT-PATH)
	code $(DOT-PATH)

run:
	npm run dev