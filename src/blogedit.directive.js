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
    }])
    .directive('youtube', ['$sce', function ($sce) {
        return {
            restrict: 'E',
            replace: true,
            template: '<div class="embed-responsive embed-responsive-16by9"><iframe class="embed-responsive-item" allowfullscreen src="{{url}}"/></div>',
            link: function (scope, iElem, iAttrs) {
                scope.url = $sce.trustAsResourceUrl(iAttrs.url);
            }
        }
    }]);