/**
 * Created by sumedas on 01-May-15.
 */
angular
    .module('meow.blog.edit')
    .directive('post',['$compile', 'marked', function ($compile, marked){
        return {
            restrict: 'A',
            replace: true,
            link: function (scope, iElem, iAttrs) {
                scope.$watch(iAttrs.post, function(markDown) {
                    if (markDown && typeof markDown === 'string' && markDown.length !== 0) {
                        iElem.html(marked(markDown));
                        $compile(iElem.contents())(scope);//
                    }
                });
            }
        }
    }]);