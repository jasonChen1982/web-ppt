# 分享标题
大家好，很高兴今天给大家带来 从矩阵走入 WebGL 世界 这个主题。
初次见面，可能大家都不认识我。下面我先做个简单的自我介绍。

# 自我介绍
我叫陈剑鑫，大家可以叫我小名JC，
是一名来自阿里UC的前端开发工程师，
现在是主要负责我们厂的活动营销方面的业务开发，
还有一个标签就是沉迷于可编程动画、webgl等图形技术的一个前端开发。
虽然这样介绍完之后大家也不一定就认识我了，但是没关系，大家只要记住我本次分享的主角 矩阵 就好了

# 感受下矩阵
在我们开始接触矩阵之前，先来看看矩阵到底有什么用，到底给我们带来了什么，初步感受下矩阵的魅力
下面是我随意弄的几个矩阵在项目中的使用效果录屏，可以一起来看一看

1、这个效果是纯canvas 2d原生api实现的一个分裂球loading效果，过程中还可以简单的交互
看到这样的loading效果是不是愿意多等几秒钟？？

2、这是之前一个项目的一个页面，有了这个效果是不是感觉页面的档次一下就提高了很多。

3、这个也是之前一个活动的loading效果，同样也是用纯canvas 2d原生api实现的，
其实实现这种效果的套路一般是先生成模型的几何数据点，再将三维坐标投影成二维坐标，
然后用canvas 2d的API来进行绘制，看起来很复杂的样子，其实代码也就只有3到4k的样子。

# 矩阵
其实刚才看到的那些效果的基础部分都是通过矩阵来处理的，看到那些效果是不是感觉还挺好玩的？
讲到矩阵，可能有些人可能会感觉矩阵很陌生，我们不做营销活动业务啊，矩阵对我们来说完全用不到啊，和矩阵没有任何交集啊，处理数据业务的时候用不到、逛淘宝的时候用不到、挤地铁的时候用不到。
其实啊矩阵和我们还是有很多交集的，大家在不经意间用到过她们，只不过是浏览器把它们封装的更简单了，你感觉不到你正在使用矩阵而已。
最常用的css3 transform

# css3 transform
transform和矩阵有着千丝万缕的联系，有了解过transform的童鞋可能知道transform的各种变换效果在浏览器底层都是通过matrix来实现的。
例如translate、rotate、scale、skew这些功能在底层都是用矩阵来实现的，这些变换函数可以让我们的波波老师分别做着欢快的动画。
我们知道除了css 2d变换，css3还带来了让我们兴奋不已的三维变换，其中最让我们激动（印象深刻）的就是三维变换里面的三维旋转变换了，
例如下面的这个旋转的立方体。讲到三维旋转，这里要多讲一点的是 数学里面描述一个物体在三维空间里面的旋转姿态一般有三种方法，
第一种不用说咯，就是矩阵咯，都说了css3 transform的这些子函数最后都会用矩阵来底层实现的嘛，对吧。除了矩阵，还有两种更为直观的描述形式，一种是欧拉角的形式，另一种就是四元数的形式。
欧拉角听起来好像很高大上的感觉，其实它对应的就是我们常用的rotateX｜Y｜Z系列，欧拉角的含义就是描述一个物体围绕自身的坐标轴旋转多少角度。
四元数这名字听起来不伦不类的，其实四元数就大概可以对应到rotate3d，rotate3d大家平时用到的可能相对会比较少，这里要提一嘴的就是，
网上有很多技术文章对他的解释都是有误的，rotate3d接受四个参数嘛，很多文章说这四个参数前三个是0到1之间的数字，第四个参数是旋转的角度。
这样的说法是错误的，或者说只说对了四分之一，因为rotate3d是基于四元数的一个变形，
他前面的三个参数实际上是一个方向向量，既然是方向向量就没有什么0到1之间的这么一说了对吧，任意有限的数值。浏览器在接收到rotate3d的参数后会先对传入的那个方向向量进行一个归一化操作，
然后再将角度除以2之后正弦余弦，转化成四元数，这里就不详细往下讲了哈，只要记住前面三个参数是一个向量就好了
除此之外还有svg里面也提供了矩阵相关的操作，这一个demo就是通过操作每一个svg元素的transform属性来设置元素的位置移动，
canvas里面也同样提供了矩阵相关的操作，在获取到canvas的绘图上下文之后，可以设置context.scale、context.translate啊来让物体的进行相应的变换，这其实就是在操作矩阵。

所以说矩阵和我们还是很熟的，我们经常会用到他们。并且也可以看出矩阵在现代浏览器中有着至关重要的作用。假如没有了矩阵你会顿时感觉前端变成了一个没有爱的前端

# 矩阵是什么
讲了这么久矩阵，还没看到矩阵到底长什么样的对吧。
这就是矩阵，长得方方正正的，有点微胖。
并且根据刚才的示例和介绍我们也都知道了，矩阵的作用是用来描述物体在几何空间内的各种变换的。

那我们知道了矩阵是用来描述物体在几何空间内的各种变换的，那我们是怎么去利用它的这个特性的呢？
我们主要是通过矩阵的乘法来使用矩阵的几何特性的，像第一个式子就是矩阵对坐标点变换的过程。
携带变换信息的矩阵乘以待变换的坐标点最后会得到变换之后的坐标点，大家应该还记得矩阵的乘法公式吧，看到大家都不做声的样子就知道大家都记得。
a行b列矩阵乘以b行c列最后会得到a行c列矩阵，有点绕口。
还有一个就是矩阵乘法不符合乘法交换律，其实这个特性很多同学可能都有遇到过。
比如我要让一个物体先位移然后再围绕自己的中心点进行旋转的需求，然而得到的却不是你想要的。
这就是因为矩阵不符合交换律，所以当我们在使用transform的那些变换方法的时候，各个变换的顺序就显得非常重要了。
A乘以B不等于B乘以A，即使她们变化的值都一样

# 价值
讲到这里可能有些同学会想，矩阵厉害是厉害，但是这些东西浏览器都帮我们处理好了，我们为什么还要花时间去学习了解这个长的不是很友好的矩阵呢。研究他的价值在哪里？
其实最前面的几个实例就说明了它的价值，因为浏览器并没有给我们提供实现这种效果的api啊，那我们作为一名有追求有理想的前端怎么可能甘心被浏览器给限制住呢，对吧～～～
为了把项目做的更好，深入了解矩阵就很有必要了。
好了安利完了矩阵的价值，我们继续。
为了我们对动画的信仰，我们进一步的来了解矩阵。
学什么都得从最简单的开始，先来看看单位矩阵，就像我们以前学向量要先学单位向量一样
单位矩阵的定义就是对角线全为1，他有什么作用呢，看下面这个例子，我用transform的matrix3d方法把这个矩阵传给了这个红色的方块，
发现这个方块没有做任何变化，这也正和单位矩阵的名字一样，单位嘛，就像单位向量乘以任何向量得到的还是那个向量。

这里我快速的列出了我们比较常见的矩阵们，由于时间关系我就不一一推导了哈，有兴趣的可以私下找我聊哈，我挑其中一个比较有代表性的快速推导一下，
绕Z轴旋转，大家先看看Z轴旋转矩阵的长相，旋转β角的旋转矩阵就是这样的，余弦β、负的正弦β、正弦β、余弦β，其余的全是0啊1啊。
绕Z轴旋转，因为我们知道的一个常识就是坐标点绕哪个轴旋转，那么该坐标点在该轴的分量是保持不变，什么意思，就是空间内点(x y z)绕Z轴旋转，z分量是始终保持不变。
那这样一来绕Z轴旋转就可以简化到x－y的二维笛卡尔坐标系上讨论了，
这样一来就很好推了，xy绕Z轴旋转β角度后到了x`y`，然后我们可以很快的得到这样一个式子
。。。
这个式子里面有很多都是已知的，r、β、α
利用公式代入，最后化简得到这个，x` = 这个 y` = 这个
看到这里是不是有点眼熟啊，那我们假设z轴旋转矩阵是这个，直接利用矩阵的乘法公式展开同样得到这个等式。

不难吧，看到大家都听懂了的样子好开心。

# 矩阵+WebGL
搞清楚了矩阵，下面我们就利用webgl的原生api来用一用刚才说的那些矩阵。

# webgl
讲到webgl，这里稍微做一下介绍。和canvas不一样的是webgl是一个可编程的渲染管线，这就意味着你可以介入到图形渲染的几乎任何一个过程，实现更丰富的效果。
其实搞懂了webgl的渲染流水线之后你会对浏览器的渲染过程更加了解，并且可以解释一些你之前觉得很奇怪的现象，比如有些时候你在使用一些强制分组的样式的时候会导致子级的3d效果失效啊。并且能帮助你理解浏览器的合成化渲染机制。

这里是利用了位移矩阵，通过位移矩阵的z轴的描述来改变场景内的坐标点沿着Z轴运动，为了视觉效果好看我这里加上透视矩阵实现这种近大远小大效果。
其实透视矩阵做的事情就是让离你越近的点的运动越明显，离你越远的点运动越不明显。

这里是利用了X轴旋转矩阵，首先用数学函数生成了螺旋形状的这些数据点，然后再通过X轴旋转矩阵让这些点绕X轴旋转。

这里是利用了旋转矩阵＋位移矩阵形成的效果，是不是发现只是进行这些简单的组合就能实现非常酷炫的效果。

可能有些同学会想，这些效果炫是炫，但是不实用啊。那我们就来一个使用一点的。
用利用矩阵实现这样一个旋转的loading效果。

# 结合其它的知识点
刚才的例子都是单纯的利用矩阵来实现的效果，基本上没用到其他的知识点。但是即使光是使用矩阵，做出来的效果还是蛮好玩的。
下面来介绍下矩阵配合其它的图形学知识点来实现更复杂一点的效果。

# AR 
都说到了webgl了，怎么能不聊聊今年这么火的AR呢对吧，
来看看矩阵在AR上的应用，增强现实。
大部分比较完整的AR都有一个步骤就是从真实的世界图像里面表定照相机的姿态参数或者物体的姿态参数。
然后基于得到的这个视角的坐标姿态信息来重建虚拟的三维世界到世界图像中。
但是这么好玩的东西，在移动端实现却有很多阻碍
因为AR要动态的跟踪真实场景的变化来调整虚拟世界的姿态嘛，所以就需要图像内容的读取能力。
但是目前大部分浏览器都不能直接用js读取视频图像内容，甚至在你引入webRTC的视频流的时候就已经崩溃了。

# VR 
讲了AR怎么能不讲VR呢，来看看矩阵在VR上的应用。
VR相比于AR，在技术组成上要多一些，真正的VR一般都包括头显、手柄、探测部件啊等。
这些东西的成本太高了，要硬件设备，但是目前环境下我们可以玩玩VR视觉。
这里是刚才的星空效果的VR版，戴上VR眼镜你可以四处观察，在转场运动的时候感受粒子向你扑来的效果。
由于时间关系，我门重点来体验一下这一个demo哈。
这里面开场的时候有一个非均匀有理B样条的使用，实现这种不同视角的平滑切换。然后配合手机的传感器来控制里面的那个小车。
我这里有一个眼镜可以大家传递着看一下。


为什么我们人可以感受到三维世界，是因为我们是用两个眼睛去观察的，可以做个实验，你用手遮住一个眼睛，用另外一个眼睛观察你身边的一个细物体，用你的一个手指去触碰它，你会感觉我快要触碰到它了啊，但是你再往前伸一点你才真正的碰到它，这就是因为你只用一个眼睛去观察它，丢失了一个维度的信息，让你对深度不敏感了。同理从屏幕里面出来的三维图像，在屏幕这个过程就已经丢失了一个维度的信息，所以，我们想要还原这个信息就应该，把丢失的这个维度找回来。


到这个时候是不是突然发现矩阵可以给你整个世界，还要什么自行车啊

# Q&A
随着这个demo，本次分享也接近尾声，大家有没有什么问题想问的啊？

# THX
最后谢谢大家。



