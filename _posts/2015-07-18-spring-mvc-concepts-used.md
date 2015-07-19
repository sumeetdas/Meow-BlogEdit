<!--
published-date: 2015-07-18
title: spring mvc concepts used
tags: spring, mvc
-->

## @Component

The @Component annotation marks a java class as a bean so the component-scanning mechanism of spring can pick it up and pull it into the application context. This can later be autowired into other classes.

## @Repository
The best way to guarantee that your Data Access Objects (DAOs) or repositories provide exception translation is to use the  @Repository annotation. 

*Annotate all DAO classes with @Repository annotation*

```java
@Repository
public class GenericDao
      implements IGenericDao	
{
    //...
}
```

**This annotation also allows the component scanning support to find and configure your DAOs and repositories without having to provide XML configuration entries for them.**

```xml
<!-- This will find and configure our Generic DAO -->
<context:component-scan base-package="com.example.generic"/> 
```

## @Autowired

Example:

```java
@Autowired
private IGenericDao genericDao;
```
