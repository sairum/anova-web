.PHONY: css anovajs mainjs simulatejs chartjs clean watch optimize

#CAT = @cat
CAT =	@sed '/\#DEBUG/,/!DEBUG/d' 

cssfiles = src/css/style.scss

anova = src/anova/src/*.js

main = src/anova/main.js

simulate = src/simulate/simulate.js

chart = src/chart/chart.js

css: $(cssfiles)
	@echo Built style.css
	@sassc src/css/style.scss css/style.css

anovajs: $(anova) 
	@echo Building anova.js
	$(CAT) src/anova/anova_header.js > js/anova.js 
	$(CAT) $^ >> js/anova.js
	$(CAT) src/anova/anova_api.js >> js/anova.js

mainjs: $(main) 
	@echo Building main.js
	$(CAT) src/anova/main.js > js/main.js
	
simulatejs: $(simulate) 
	@echo Building simulate.js
	$(CAT) src/simulate/simulate.js > js/simulate.js
	
chartjs: $(chart) 
	@echo Building chart.js
	$(CAT) src/chart/chart.js > js/chart.js
	
watch:
	@echo Watching for changes...
	@while true; do \
		inotifywait -qr -e close -e create -e delete  src/anova/*.js src/anova/src/*.js src/simulate/*.js src/chart/*.js; \
		make optimize; \
	done

optimize: anovajs mainjs css simulatejs chartjs
	@jsmin < js/anova.js > js/anova.min.js 
	@jsmin < js/main.js > js/main.min.js 
	@jsmin < js/simulate.js > js/simulate.min.js 
	@jsmin < js/chart.js > js/chart.min.js
	@jsmin < css/style.css > css/style.min.css
#	#@yuicompressor assets/all.js -o assets/all.js
#	@echo Optimized

clean:
	@rm -f js/anova*.js js/main*.js js/simulate*.js js/chart*.js 
