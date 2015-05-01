/**
 * Created by sumedas on 01-May-15.
 */
angular
    .module('meow.blog.edit')
    .controller('BlogEditListCtrl', ['$scope', '$blogEdit', '$state', function ($scope, $blogEdit, $state) {
        /**
         * Load blogs on state change
         * This controller is used by two states and is required to load
         * blogs based on whether the URL is /blogs/tag/:tag or not.
         */
        $scope.$on('$stateChangeSuccess', function loadBlogs () {
            if (undefined === $state.params.tag) {
                $blogEdit.getBlogs(function (pData) {
                    $scope.blogs = pData;
                });
            } else {
                console.log($state.params.tag);
                $blogEdit.getBlogsByTag($state.params.tag, function (pData) {
                    $scope.blogs = pData;
                });
            }
        });
        // load next set of blogs
        $scope.next = function () {
            $blogEdit.getNextBlogs(function (data) {
                $scope.blogs = data;
            })
        };
        // load previous set of blogs
        $scope.prev = function () {
            $blogEdit.getPrevBlogs(function (data) {
                $scope.blogs = data;
            });
        };
        // determine if the current page is the first page of the result list
        $scope.isFirstPage = function () {
            return $blogEdit.getCurrentPageNo() === 1;
        };
        // determine if the current page is the last page of the result list
        $scope.isLastPage = function () {
            return $blogEdit.getCurrentPageNo() === $blogEdit.getPageCount();
        };
        $scope.getFormattedDate = function (pBlog) {
            return $blogEdit.parseFileName(pBlog.fileName).formattedDate;
        };
        // function to go to blog.edit state when the title is clicked upon
        $scope.goToBlog = function (pBlog) {
            var metaData = $blogEdit.parseFileName(pBlog.fileName);

            $state.go('blog.edit', {
                year: metaData.year,
                month: metaData.month,
                date: metaData.date,
                slug: metaData.slug
            });
        };
    }])
    .controller('BlogEditPostCtrl', ['$scope', '$http', '$stateParams', '$blogEdit', function ($scope, $http, $stateParams, $blogEdit) {

        var year = $stateParams.year,
            month = $stateParams.month,
            date = $stateParams.date,
            slug = $stateParams.slug;

        $blogEdit.getBlog({
            year: year,
            month: month,
            date: date,
            slug: slug
        }, function (pData) {
            $scope.blog.post = pData;
        });

        $scope.revertBlog = function () {
            $blogEdit.getBlog({
                year: year,
                month: month,
                date: date,
                slug: slug
            }, function (pData) {
                $scope.blog.post = pData;
            }, true);
        };

        $scope.saveBlog = function () {
            $blogEdit.saveBlog({
                post: $scope.blog.post,
                year: year,
                month: month,
                date: date,
                slug: slug
            });
        };

        $scope.deleteBlog = function () {
            $blogEdit.deleteBlog({
                year: year,
                month: month,
                date: date,
                slug: slug
            });
        }
    }])
    .controller('BlogEditPostSideCtrl', [function () {

    }])
    .controller('BlogEditCtrl', ['$blogEdit', '$scope', '$state', function ($blogEdit, $scope, $state) {
        // needed for ui select
        $scope.queryTag = {};

        // loads tags
        $blogEdit.getTags (function (data) {
            $scope.tags = data;
        });

        $scope.getBlogsByTag = function (pTag) {
            $state.go('blog.list.tag', {
                tag: pTag
            });
        };
    }]);