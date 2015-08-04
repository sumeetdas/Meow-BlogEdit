# Meow-BlogEdit
Angular module used with Meow blogging engine to view blogs.

You could see the demo here : http://meow-sample-app.herokuapp.com/blogs/edit/login?meow=test123

test123 is the secret param which Meow blogging engine will check before serving edit page

Credentials: username: admin, password: test.123

### Features

* This module is created using angular-route.

* It leverages the responsive utility classes provided by bootstrap to help the app adapt to various screen sizes. You could easily edit the post in mobile too.
  
* It has a search feature which will help users to search titles, tags and keywords

* You could edit the post as well as see the rendered view on the same page

* The module asks the user to enter the title's name before deleting a blog post

### Installation

Run the following command:

```
bower install meow-blogedit
```

and add the following lines in the head tag of your index.html file:

```html
<head>
  <!-- other contents -->
  <link rel="stylesheet" href="/bower_components/meow-blogedit/dist/css/meow-blogedit.min.css"/>
  <script src="/bower_components/meow-blogedit/dist/meow-blogedit.min.js"></script>
  <script>
    angular.module('app', ['meow.blog.edit']);
  </script>
  
  <!-- other contents -->
</head>
```

and finally add this tag inside your body tag:

```html
<body>
  <!-- other contents -->
  
  <div ng-view></div>
  
  <!-- other contents -->
</body>
```

and you are done with the setup!

### LICENSE

MIT License, Copyright (c) 2015 Sumeet Das
