/**
 * Created by sumedas on 01-May-15.
 */
angular
    .module('meow.blog.edit')
    .service('$blogEdit', ['$http', function ($http) {
        var currentPageNo = 1, pageCount = 1, blogsPerPage = 5, pageBlogList = [], tags = [],
            currentBlog = '';

        function getTags (pCallBack) {
            if (tags.length === 0) {
                $http
                    .get('/tags')
                    .success(function (data) {
                        if (!data || ! data instanceof Array) {
                            data = ['meow','bow'];
                        }
                        tags = data;
                        pCallBack(data);
                    })
                    .error(console.error);
            }
            else {
                pCallBack(tags);
            }
        }

        function computePageCount () {
            var len = pageBlogList.length;
            return len ? parseInt (len / blogsPerPage) + (len % blogsPerPage === 0 ? 0 : 1) : 1;
        }

        function getBlogsByTag (pTag, pCallBack) {
            $http
                .get('/blogs/tag/' + pTag)
                .success(function (data) {
                    pageBlogList = data;
                    pageCount = computePageCount();
                    currentPageNo = 1;
                    if (typeof pCallBack === 'function') {
                        pCallBack (pageBlogList.slice(0, blogsPerPage));
                    }
                })
                .error(console.error);
        }

        function getBlogs (pCallBack) {
            $http
                .get('/blogs')
                .success(function (data) {
                    pageBlogList = data;
                    pageCount = computePageCount();
                    currentPageNo = 1;
                    if (typeof pCallBack === 'function') {
                        pCallBack (pageBlogList.slice(0, blogsPerPage));
                    }
                })
                .error(console.error);
        }

        function getBlog (pBlog, pCallBack, pCache) {
            if (pCache) {
                pCallBack (currentBlog);
            }
            else {
                $http
                    .get('/blogs/post/' + pBlog.year + '/' + pBlog.month + '/' + pBlog.date + '/' + pBlog.slug)
                    .success(function (pData) {
                        currentBlog = pData;
                        pCallBack(currentBlog);
                    })
                    .error(console.error);
            }
        }

        function saveBlog (pBlog) {
            var isNewBlog = !pBlog.slug || !pBlog.year || !pBlog.month || !pBlog.date;

            if (isNewBlog) {
                $http
                    .post('/blogs', pBlog.post)
                    .success(console.log)
                    .error(console.error);
            }
            else {
                $http
                    .put('/blogs/' + pBlog.year + '/' + pBlog.month + '/' + pBlog.date + '/' + pBlog.slug)
                    .success(console.log)
                    .error(console.error);
            }
        }

        function deleteBlog (pBlog) {
            $http
                .delete('/blogs/' + pBlog.year + '/' + pBlog.month + '/' + pBlog.date + '/' + pBlog.slug)
                .success(console.log)
                .error(console.error);
        }

        function getPrevBlogs (pCallBack) {
            if (currentPageNo > 1) {
                currentPageNo = currentPageNo - 1;
                pCallBack (pageBlogList.slice( (currentPageNo - 1) * blogsPerPage, currentPageNo * blogsPerPage));
            }
        }

        function getNextBlogs (pCallBack) {
            if (currentPageNo < pageCount) {
                currentPageNo = currentPageNo + 1;
                pCallBack (pageBlogList.slice( (currentPageNo - 1) * blogsPerPage, currentPageNo * blogsPerPage));
            }
        }

        function parseFileName (pFileName) {
            if (typeof pFileName !== 'string') {
                throw new Error ('pFileName is not a string');
            }

            var arr   = pFileName.split('-'),
                year  = arr.shift(),
                month = arr.shift(),
                date  = arr.shift(),
                slug  = arr.join('-');

            var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
                'August', 'September', 'October', 'November', 'December'];

            return {
                year: year,
                month: month,
                date: date,
                slug: slug,
                formattedDate: months[month - 1] + ' ' + parseInt(date) + ', ' + year
            }
        }

        return {
            getCurrentPageNo: function () {  return currentPageNo; },
            getPageCount: function () { return pageCount; },
            getBlogsByTag: getBlogsByTag,
            getBlogs: getBlogs,
            getBlog: getBlog,
            saveBlog: saveBlog,
            deleteBlog: deleteBlog,
            getPrevBlogs: getPrevBlogs,
            getNextBlogs: getNextBlogs,
            getTags: getTags,
            parseFileName: parseFileName,
            getBlogsPerPage: function () { return blogsPerPage; },
            setBlogsPerPage: function (pBlogsPerPage) { blogsPerPage = pBlogsPerPage; }
        };
    }]);