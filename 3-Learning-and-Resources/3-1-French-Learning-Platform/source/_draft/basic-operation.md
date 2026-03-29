
* [Chapter2](/Word-Phraze/chapter2.html)

---
title: quick start
date: 2023-09-01 10:15:38
---
## 文本标题
我展示的是一级标题
=================

我展示的是二级标题
-----------------

*斜体文本*  
_斜体文本_  
**粗体文本**  
__粗体文本__  
***粗斜体文本***   
___粗斜体文本___  

<font face="微软雅黑" >微软雅黑</font>  
<font face="华文彩云" >华文彩云</font>  

<font size=2 >2号字</font>  
<font size=5 >5号字</font>  

<font color=#FF000 >红色</font>  
<font color=#008000 >绿色</font>   
<font color=#FFFF00 >黄色</font>

<font face="华文彩云" font size=2 font color=#FFFF00>华文彩云</font>  




***   

~~BAIDU.COM~~
* * *
<u>带下划线文本</u>
*****
创建脚注格式类似这样 [^RUNOOB]

[^RUNOOB]: 菜鸟教程 -- 学的不仅是技术，更是梦想！！！
- - -

## 序号
* 第一项
* 第二项
* 第三项

+ 第一项
+ 第二项
+ 第三项


- 第一项
- 第二项
- 第三项

1. 第一项
2. 第二项
3. 第三项


1. 第一项：
    - 第一项嵌套的第一个元素
    - 第一项嵌套的第二个元素
2. 第二项：
    - 第二项嵌套的第一个元素
    - 第二项嵌套的第二个元素
----------

## 引用
> 区块引用
> 菜鸟教程
> 学的不仅是技术更是梦想

> 最外层
> > 第一层嵌套
> > > 第二层嵌套

> 区块中使用列表
> 1. 第一项
> 2. 第二项
> + 第一项
> + 第二项
> + 第三项

* 第一项
    > 菜鸟教程
    > 学的不仅是技术更是梦想
* 第二项

## 代码
`printf()` 函数


```javascript
$(document).ready(function () {
    alert('RUNOOB');
});
```
## 链接
这是一个链接 [菜鸟教程](https://www.runoob.com)  
<https://www.runoob.com>  

这个链接用 1 作为网址变量 [Google][1]
这个链接用 runoob 作为网址变量 [Runoob][runoob]
然后在文档的结尾为变量赋值（网址）

  [1]: http://www.google.com/
  [runoob]: http://www.runoob.com/

## 图片
![RUNOOB 图标](http://static.runoob.com/images/runoob-logo.png)

![RUNOOB 图标](http://static.runoob.com/images/runoob-logo.png "RUNOOB")

![alt 属性文本](图片地址)

![alt 属性文本](图片地址 "可选标题")

图片居中，两张并排
<div align=center>
<img src="/author.jpg" width = "500" height = "500"/> 

Self-Introduction 자기 소개   

<figure class="half">
    <img src="/movie.png" width = "400" height = "500">
    <img src="/show.png" width = "600" height = "500">
</figure>
</div>

图片放在文字的右边
<img align="right" src="https://img-blog.csdnimg.cn/6ee7cacc267b4ec8b570b2ab9c0a0ce1.png"/>


这个链接用 1 作为网址变量 [RUNOOB][1].
然后在文档的结尾为变量赋值（网址）

[1]: http://static.runoob.com/images/runoob-logo.png


<img decoding="async" src="http://static.runoob.com/images/runoob-logo.png" width="50%">

## 表格
|  表头   | 表头  |
|  ----  | ----  |
| 单元格  | 单元格 |
| 单元格  | 单元格 |


| 左对齐 | 右对齐 | 居中对齐 |
| :-----| ----: | :----: |
| 单元格 | 单元格 | 单元格 |
| 单元格 | 单元格 | 单元格 |


$$
\begin{Bmatrix}
   a & b \\
   c & d
\end{Bmatrix}
$$
$$
\begin{CD}
   A @>a>> B \\
@VbVV @AAcA \\
   C @= D
\end{CD}
$$


使用 <kbd>Ctrl</kbd>+<kbd>Alt</kbd>+<kbd>Del</kbd> 重启电脑


Welcome to [Hexo](https://hexo.io/)! This is your very first post. Check [documentation](https://hexo.io/docs/) for more info. If you get any problems when using Hexo, you can find the answer in [troubleshooting](https://hexo.io/docs/troubleshooting.html) or you can ask me on [GitHub](https://github.com/hexojs/hexo/issues).

## Quick Start

### Create a new post

``` bash
$ hexo new "My New Post"
```

More info: [Writing](https://hexo.io/docs/writing.html)

### Run server

``` bash
$ hexo server
```

More info: [Server](https://hexo.io/docs/server.html)

### Generate static files

``` bash
$ hexo generate
```

More info: [Generating](https://hexo.io/docs/generating.html)

### Deploy to remote sites

``` bash
$ hexo deploy
```

More info: [Deployment](https://hexo.io/docs/one-command-deployment.html)
