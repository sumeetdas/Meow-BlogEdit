<!--
published-date: 2015-07-18
title: Velocity Template in ClearTrial
tags: sql, vm
-->

VTL = Velocity Template Language

### Comments

```vm
## This is a single line comment.

#*
 Thus begins a multi-line comment. Online visitors won't
 see this text because the Velocity Templating Engine will
 ignore it.
*#

This text is visible. ## This text is not.

This text is visible. #* This text, as part of a multi-line
comment, is not visible. This text is not visible; it is also
part of the multi-line comment. This text still not
visible. *# This text is outside the comment, so it is visible.

#**
This is a VTL comment block and
may be used to store such information
as the document author and versioning
information:
@author
@version 5
*#
```

### Variables

The shorthand notation of a variable consists of a leading "$" character followed by a VTL Identifier. A *VTL Identifier* must start with an alphabetic character (a .. z or A .. Z). The rest of the characters are limited to the following types of characters:

1. alphabetic (a .. z, A .. Z)
2. numeric (0 .. 9)
3. hyphen ("-")
4. underscore ("_")

Examples:

```vm
$foo
$mudSlinger
$mud-slinger
$mud_slinger
$mudSlinger1
```

### Macros

The #macro script element allows template designers to define a repeated segment of a VTL template. 

```vm
#macro( d )
<tr><td></td></tr>
#end
```

The Velocimacro being defined in this example is d, and is called as follows:

```vm
#d()
```

A macro can take arguments as well

```vm
#macro( tablerows $color $somelist )
#foreach( $something in $somelist )
    <tr><td bgcolor=$color>$something</td></tr>
#end
#end
```

There are two #end statements in the definition of the #tablerows Velocimacro; the first belongs to the #foreach, the second ends the Velocimacro definition.


Here's an example of *tablerows* macro's usage:

```vm
#set( $greatlakes = ["Superior","Michigan","Huron","Erie","Ontario"] )
#set( $color = "blue" )
<table>
    #tablerows( $color $greatlakes )
</table>
```

### If/ ElseIf/ Else

#if( $foo )
   <strong>Velocity!</strong>
#end

The variable $foo is evaluated to determine whether it is true, which will happen under one of two circumstances: (i) $foo is a boolean (true/false) which has a true value, or (ii) the value is not null. 

In the following example, suppose that $foo has a value of 15 and $bar has a value of 6.

#if( $foo < 10 )
    <strong>Go North</strong>
#elseif( $foo == 10 )
    <strong>Go East</strong>
#elseif( $bar == 6 )
    <strong>Go South</strong>
#else
    <strong>Go West</strong>
#end

In this example, $foo is greater than 10, so the first two comparisons fail. Next $bar is compared to 6, which is true, so the output is Go South.


### Foreach

<ul>
#foreach( $product in $allProducts )
    <li>$product</li>
#end
</ul>

This #foreach loop causes the $allProducts list (the object) to be looped over for all of the products (targets) in the list.



