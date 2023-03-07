.PHONY: css anovajs simulatejs samplejs chartjs supportjs examplesjs clean watch optimize

#CAT = @cat
CAT =	@sed '/\#DEBUG/,/!DEBUG/d'

cssfiles = src/css/style.scss

anova = src/anova/src/*.js

simulate = src/simulate/src/*.js

sample = src/sample/src/*.js

chart = src/chart/chart.js

support = src/support/support.js

examples = src/examples/examples.js


css: $(cssfiles)
	@echo Built style.css
	@sassc src/css/style.scss css/style.css
	
anovajs: $(anova) 
	@echo Building anova.js
	$(CAT) src/anova/anova_header.js > js/anova.js 
	$(CAT) $^ >> js/anova.js
	$(CAT) src/anova/anova_api.js >> js/anova.js
	
simulatejs: $(simulate) 
	@echo Building simulate.js
	$(CAT) src/simulate/simulate_header.js > js/simulate.js
	$(CAT) $^ >> js/simulate.js
	$(CAT) src/simulate/simulate_api.js >> js/simulate.js 
	
samplejs: $(sample)
	@echo Building sample.js
	$(CAT) src/sample/sample_header.js > js/sample.js
	$(CAT) $^ >> js/sample.js
	$(CAT) src/sample/sample_api.js >> js/sample.js
	
chartjs: $(chart) 
	@echo Building chart.js
	$(CAT) src/chart/chart.js > js/chart.js

supportjs: $(support)
	@echo Building support.js
	$(CAT) src/support/support.js > js/support.js

examplesjs: $(examples)
	@echo Building examples.js
	$(CAT) src/examples/examples.js > js/examples.js
	
watch:
	@echo Watching for changes...
	@while true; do \
		inotifywait -qr -e close -e create -e delete \
		src/anova/*.js src/anova/src/*.js src/simulate/*.js \
		src/simulate/src/*.js src/examples/*.js src/sample/*.js \
		src/sample/src/*.js src/support/*.js src/chart/*.js \
		src/css/*.scss; make optimize; \
	done
	
optimize: anovajs css simulatejs chartjs samplejs supportjs examplesjs
#	@echo Optimizing...
	@jsmin < js/anova.js > js/anova.min.js
	@jsmin < js/simulate.js > js/simulate.min.js
	@jsmin < js/sample.js > js/sample.min.js
	@jsmin < js/chart.js > js/chart.min.js
	@jsmin < js/support.js > js/support.min.js
	@jsmin < js/examples.js > js/examples.min.js
	@jsmin < css/style.css > css/style.min.css
# 	@minify js/anova.js > js/anova.min.js
# 	@minify js/simulate.js > js/simulate.min.js
# 	@minify js/sample.js > js/sample.min.js
# 	@minify js/chart.js > js/chart.min.js
# 	@minify css/style.css > css/style.min.css
#@yuicompressor assets/all.js -o assets/all.js
	
clean:
	@rm -f js/anova*.js js/simulate*.js js/sample*.js js/chart*.js js/support*.js
