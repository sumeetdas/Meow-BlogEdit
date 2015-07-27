/**
 * Created by sumedas on 01-May-15.
 */
angular
    .module('meow.blog.edit')
    .controller('BlogEditCtrl', ['$scope', '$blogEdit', '$location', 'meta', '$timeout', '$route',
        function ($scope, $blogEdit, $location, meta, $timeout, $route) {

        $scope.blogToEdit = {};

        $scope.blogToDelete = {};

        $scope.previewBlog = {};

        $scope.verify = {
            deleteInput: '',
            deleteDone: false,
            blogSaved: false,
            incorrectDeleteInput: false
        };

        $scope.error = {
            blogSaved: false,
            blogDeleted: false
        };

        $scope.message = {
            blogSaved: 'The blog has been saved.',
            blogDeleted: 'The blog has been deleted.'
        };

        $scope.username = meta.username;

        // load next set of blogs
        $scope.next = function () {
            $blogEdit.getNextBlogs(function (data) {
                $scope.blogs = data;
            }, meta.blogsPerPage)
        };

        // load previous set of blogs
        $scope.prev = function () {
            $blogEdit.getPrevBlogs(function (data) {
                $scope.blogs = data;
            }, meta.blogsPerPage);
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

        $scope.loadBlog = function (pBlog) {
            var blogParams = $blogEdit.parseFileName(pBlog.fileName);
            // loads blog
            $blogEdit.getBlog({
                year: blogParams.year,
                month: blogParams.month,
                date: blogParams.date,
                slug: blogParams.slug
            }, function (pData) {
                $scope.blogToEdit = pData;

                $scope.getPreviewBlog(pData);
                // tempBlog = angular.copy(pData);
            });
        };

        $scope.deleteBlog = function (pBlog) {

            // console.log(pBlog.title, $scope.verify.deleteInput);
            if ($scope.verify.deleteInput !== pBlog.title)
            {
                $scope.verify.deleteDone = false;
                $scope.verify.incorrectDeleteInput = true;
                return;
            }

            pBlog = $blogEdit.parseFileName(pBlog.fileName);

            $blogEdit.deleteBlog(pBlog,
                function (pStatus, pData) {
                    if ('success' === pStatus)
                    {
                        $scope.verify.deleteDone = true;
                        $scope.message.blogDeleted = 'The blog has been deleted.';
                    }
                    else if ('error' === pStatus)
                    {
                        $scope.verify.deleteDone = false;
                        $scope.error.deleteDone = true;
                        $scope.message.blogDeleted = 'Error - ' + (pData ? pData : '');
                    }
                }
            );
        };

        $scope.saveBlog = function (pBlog) {

            // console.log(pBlog);

            var dateObject = $blogEdit.parseFileName(pBlog.fileName);

            $blogEdit.saveBlog({
                post: pBlog.post,
                year: dateObject.year,
                month: dateObject.month,
                date: dateObject.date,
                slug: pBlog.slug
            }, function (pStatus, pData) {
                if ('success' == pStatus)
                {
                    $scope.verify.blogSaved = true;
                    $scope.message.blogSaved = 'The blog has been saved.';
                }
                else if ('error' == pStatus)
                {
                    $scope.verify.blogSaved = false;
                    $scope.error.blogSaved = true;
                    $scope.message.blogSaved = 'Error - ' + (pData ? pData : '');
                }
            });
        };

        $scope.getPreviewBlog = function (pBlog) {
            $scope.verify.blogSaved = false;

            // needed for new blog post
            pBlog.title = pBlog.title || '';
            pBlog.slug = pBlog.slug || pBlog.title.toLocaleLowerCase().replace(/[\W]/g, '-').replace(/[\-]{2,}/g, '-');
            pBlog.fileName = pBlog.fileName || '';

            $blogEdit.previewBlog(pBlog, function (pPreviewBlog) {
                $scope.previewBlog = pPreviewBlog;
            });
        };

        $scope.blogEditSettings = {
            closeEl: '.close',
            overlay: {
                templateUrl: 'blog-edit.post.tpl.html'
            }
        };

        $scope.deleteBlogSettings = {
            closeEl: '.close',
            modal: {
                templateUrl: 'blog-edit.delete.tpl.html'
            }
        };

        $scope.search = function () {
            $location.url('/query/' + $scope.query);
        };

        $scope.purgeEditScopeVar = function () {

            if ($scope.verify.blogSaved) {
                $route.reload();
            }

            $timeout(function () {
                $scope.blogToEdit = {};
                $scope.previewBlog = {};
                $scope.verify.blogSaved = false;
                $scope.error.blogSaved = false;
                $scope.message.blogSaved = 'The blog has been saved';
            }, 1000);
        };

        $scope.purgeDeleteScopeVar = function () {

            if ($scope.verify.deleteDone) {
                $route.reload();
            }

            $timeout(function () {
                $scope.blogToDelete = {};
                $scope.verify.deleteDone = false;
                $scope.error.deleteDone = false;
                $scope.verify.deleteInput = '';
                $scope.verify.incorrectDeleteInput = false;
                $scope.message.blogDeleted = 'The blog has been deleted';
            }, 400);
        };

        $scope.loadBlogToDelete = function(pBlog) {
            $scope.blogToDelete = pBlog;
        };

        $scope.addBlog = function () {

            $scope.blogToEdit = {};

            var date = new Date(); //publishedDate.getMonth()

            $scope.blogToEdit.date = date.getDate();
            $scope.blogToEdit.month = date.getMonth() + 1;
            $scope.blogToEdit.year = date.getYear();
            //$scope.blogToEdit.slug = 'new-post';

            var publishedDate = [date.getFullYear(), date.getMonth() + 1, date.getDate()].join('-');

            var array = ['<!--', 'published-date: ' + publishedDate, 'title: New Post', 'subtitle: ', 'tags: ', 'keywords: ',
                        '-->', 'Write your post here...'];

            $scope.blogToEdit.post = array.join('\n');

            $scope.getPreviewBlog($scope.blogToEdit);
        }
    }]);