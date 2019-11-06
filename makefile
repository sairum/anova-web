.PHONY: css anovajs uijs clean watch optimize

CAT = @cat
#CAT =	@sed '/\#DEBUG/,/!DEBUG/d' 

cssfiles = src/css/style.scss

anova = src/anova/*.js

ui = src/ui/*.js

css: $(cssfiles)
	@echo Built style.css
	@sassc src/css/style.scss css/style.css
	@sassc src/css/materialize.scss css/materialize.css

#js: $(anova)
#	@echo Built anova.js

#$(cssfiles): 
#	@cat $^ >> css/ede.css

anovajs: $(anova) 
	@echo Building anova.js
	$(CAT) src/anova_header.js > js/anova.js 
	$(CAT) $^ >> js/anova.js
	$(CAT) src/anova_api.js >> js/anova.js

uijs: $(ui) 
	@echo Building ui.js
	$(CAT) src/ui_header.js > js/ui.js 
	$(CAT) $^ >> js/ui.js
	$(CAT) src/ui_api.js >> js/ui.js

watch:
	@echo Watching for changes...
	@while true; do \
		inotifywait -qr -e close -e create -e delete  src/*.js src/anova/*.js; src/ui/*.js; \
		make optimize; \
	done

optimize: anovajs uijs css
	@jsmin < js/anova.js > js/anova.min.js 
	@jsmin < js/ui.js > js/ui.min.js 
#	#@yuicompressor assets/all.js -o assets/all.js
#	@echo Optimized

clean:
	@rm -f src/anova.js src/ui.js 
