---
slug: threejs-oriental-pearl-tower
title: "使用 Three.js 绘制东方明珠塔模型"
date: 2026-09-26
category: 可视化
excerpt: "手算等边三角形与倾斜圆柱的椭圆顶点，用 BufferGeometry 装配东方明珠模型。"
tags: [Three.js, 3D]
featured: true
---

&nbsp;&nbsp;&nbsp;&nbsp;最近在看ThreeJS这块，学习了规则立体图形的绘制，想着找一个现实的建筑用ThreeJS做一个模型，这里选择了东方明珠电视塔。
看着相对比较简单一些，简单来看由直立圆柱、倾斜圆柱、球、圆锥这四种几何体组成。直立圆柱与倾斜圆柱的绘制略有不同，下面会一一介绍。
<br />
&nbsp;&nbsp;&nbsp;&nbsp;东方明珠塔主要包括底座、塔身、塔尖三部分组成，以坐标原点为中心进行绘制。

## 底座

&nbsp;&nbsp;&nbsp;&nbsp;底座的主要组成是直立的圆柱、倾斜的圆柱和圆球，直立的圆柱和圆直接使用ThreeJS提供的方法即可，
这里主要介绍三个直立圆柱坐标和倾斜的圆柱。

### 底座的坐标

&nbsp;&nbsp;&nbsp;&nbsp;底座的三个圆柱、倾斜的圆柱所在位置当成等边三角形的三个顶点即可。等边三角形的中心到三个顶点之间的距离是一致的，可以理解同一个半径的圆上的三个顶点。这里可以提出一个公共方法，以原点为中心，输入半径，自动计算出三个顶点坐标。代码如下：
```typescript
export function calculateEqulateralTriangleVertex(sideLength: number): THREE.Vector3[] {
    // 计算等边三角形的半径
    const circumradius = sideLength / Math.sqrt(3)
    // 角度为45度为第一个点
    const angles = [Math.PI / 4, (11 * Math.PI) / 12, (19 * Math.PI) / 12]

    const vertices = angles.map((angle) => {
    const x = circumradius _ Math.cos(angle)
    const z = circumradius _ Math.sin(angle)
    return new THREE.Vector3(x, 0, z)
    })

    return vertices
}
```
&nbsp;&nbsp;&nbsp;&nbsp;这里可以根据计算出的三个顶点坐标，绘制出三个直立圆柱。倾斜圆柱的绘制需要计算出倾斜圆柱顶面和底面的坐标，然后设置不同的Y值即可。计算倾斜圆柱的坐标代码如下：

```typescript
export function calculateIntersectionsVertex(sideLength: number): THREE.Vector3[] {
  // 1、计算外接圆半径（原点到各顶点的距离）
  const circumradius = sideLength / Math.sqrt(3)

  // 2、定义三个顶点
  const angles = [Math.PI / 4, (11 * Math.PI) / 12, (19 * Math.PI) / 12] as const

  // 3、计算顶点坐标
  const p1 = new THREE.Vector3(
    circumradius * Math.cos(angles[0]),
    0,
    circumradius * Math.sin(angles[0]),
  )
  const p2 = new THREE.Vector3(
    circumradius * Math.cos(angles[1]),
    0,
    circumradius * Math.sin(angles[1]),
  )
  const p3 = new THREE.Vector3(
    circumradius * Math.cos(angles[2]),
    0,
    circumradius * Math.sin(angles[2]),
  )
  // 3. 计算三条边的中点（垂线交点，纯number运算，无undefined）
  const intersection1 = new THREE.Vector3((p1.x + p2.x) / 2, (p1.y + p2.y) / 2, (p1.z + p2.z) / 2)
  const intersection2 = new THREE.Vector3((p2.x + p3.x) / 2, (p2.y + p3.y) / 2, (p2.z + p3.z) / 2)
  const intersection3 = new THREE.Vector3((p3.x + p1.x) / 2, (p3.y + p1.y) / 2, (p3.z + p1.z) / 2)

  return [intersection1, intersection2, intersection3]
}
```

&nbsp;&nbsp;&nbsp;&nbsp;这里根据计算出的三个顶点坐标，绘制出三个倾斜的圆柱。计算逻辑与绘制直立圆柱略有不同，下面将进行介绍。

### 倾斜的圆柱

&nbsp;&nbsp;&nbsp;&nbsp;倾斜的圆柱顶面和底面不是一个圆，而是一个椭圆。不能使用常规绘制圆柱的方法来绘制。这里需要创建一个组来包含椭圆柱，椭圆柱包含顶面、底面、侧面三个部分。
#### 顶面
&nbsp;&nbsp;&nbsp;&nbsp;因为是一个椭圆，这里假设顶面椭圆是32边形，使用三角函数计算出各个点的坐标。代码如下：
```typescript
const topVertices: number[] = []
// radialSegments 32
for (let i = 0; i <= radialSegments; i++) {
  const theta = thetaStart + (i / radialSegments) * thetaLength
  const x = radius * Math.cos(theta)
  const z = radius * Math.sin(theta)
  topVertices.push(topCenter.x + x, topCenter.y, topCenter.z + z)
}
```

&nbsp;&nbsp;&nbsp;&nbsp;计算出各个边的顶点之后，还需要计算出点与点之间是如何连接成三角形的，不然各个边的顶点始终是孤立的点。因为Three.js最终是渲染的三角形。代码如下：

```typescript
const topIndices: number[] = []
// radialSegments 32
for (let i = 0; i < radialSegments; i++) {
  topIndices.push(0, ((i + 1) % radialSegments) + 1, i + 1)
}
```

&nbsp;&nbsp;&nbsp;&nbsp;坐标和索引计算完成之后，需要在Three.js中创建一个BufferGeometry对象，并设置顶点坐标、索引等。代码如下：

```typescript
const topGeometry = new BufferGeometry()
// 定义那些顶点连接成三角形面，用于形成顶部盖子的扇形结构
topCapGeometry.setIndex(topIndices)
// 设置顶点位置属性
topCapGeometry.setAttribute('position', new THREE.Float32BufferAttribute(topVertices, 3))
// 计算法向量 决定了材质如何与光源交互，影响渲染效果
topCapGeometry.computeVertexNormals()
```

&nbsp;&nbsp;&nbsp;&nbsp;接下来需要创建一个材质对象，并设置材质属性。这里使用的使用MeshPhotonMaterial（一种支持高光反射的材质类型），并设置材质属性。然后把几何体参数和材质传给Mesh对象，并添加到场景中。代码如下：

```typescript
const topCapMaterial = new THREE.MeshPhongMaterial({
  color: topCapColor, // 材质颜色
  wireframe: false, // 是否是线框
  side: THREE.DoubleSide, // 材质双面可见
})

const topCap = new THREE.Mesh(topCapGeometry, topCapMaterial)
group.add(topCap)
```

#### 底面

&nbsp;&nbsp;&nbsp;&nbsp;底面的创建与顶面基本一致，主要的区别在于生成索引的顺序不同。顶面的法向量朝向Y轴正方向，形成三角形面时的索引是顺时针顺序，而底面的法向量朝向Y轴负方向，形成三角形面时的索引是逆时针顺序。其他保持一致。

#### 侧面

&nbsp;&nbsp;&nbsp;&nbsp;侧面的绘制与顶面和底面基本一致，主要区别是计算索引和侧面的坐标计算不一致。
&nbsp;&nbsp;&nbsp;&nbsp;侧面坐标需要计算三角形面的顶部坐标、底部坐标，如果侧面是由多段组成的，还需要计算每段之间的坐标。代码如下：

```typescript
// 存储顶点和索引
const vertices: number[] = []

// 计算顶点
for (let y = 0; y <= heightSegments; y++) {
  const t = y / heightSegments
  const currentY = bottomCenter.y + t * (topCenter.y - bottomCenter.y)

  for (let i = 0; i <= radialSegments; i++) {
    const theta = thetaStart + (i / radialSegments) * thetaLength

    // 椭圆参数方程
    const x = radius * Math.cos(theta)
    const z = radius * Math.sin(theta)

    // 底部椭圆顶点
    if (y === 0) {
      vertices.push(bottomCenter.x + x, currentY, bottomCenter.z + z)
    }
    // 顶部椭圆顶点
    else if (y === heightSegments) {
      vertices.push(topCenter.x + x, currentY, topCenter.z + z)
    }
    // 中间部分顶点（线性插值）
    else {
      const interpolatedX = bottomCenter.x + x + (topCenter.x + x - (bottomCenter.x + x)) * t
      const interpolatedZ = bottomCenter.z + z + (topCenter.z + z - (bottomCenter.z + z)) * t

      vertices.push(interpolatedX, currentY, interpolatedZ)
    }
  }
}
```

&nbsp;&nbsp;&nbsp;&nbsp;计算完各个顶点之后，需要计算各个顶点之间的索引。与侧面计算方式一样，如果侧面是由多段组成的，还需要计算每段之间的索引。代码如下：

```typescript
const indicles: number[] = []
// 生成索引
for (let y = 0; y < heightSegments; y++) {
  for (let i = 0; i < radialSegments; i++) {
    const a = y * (radialSegments + 1) + i
    const b = y * (radialSegments + 1) + (i + 1)
    const c = (y + 1) * (radialSegments + 1) + i
    const d = (y + 1) * (radialSegments + 1) + (i + 1)
    // 生成两个三角形
    indices.push(a, b, d)
    indices.push(a, d, c)
  }
}
```

&nbsp;&nbsp;&nbsp;&nbsp;坐标和索引计算完成之后，接下来的步骤和创建侧面和顶面的步骤一致。需要在Three.js中创建一个BufferGeometry对象，并设置顶点坐标、索引等。代码如下：

```typescript
// 设置几何体属性
sideGeometry.setIndex(indices)
sideGeometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))

// 计算法向量
sideGeometry.computeVertexNormals()

// 创建侧面网格材质
const sideMaterial = new THREE.MeshPhongMaterial({
  color, // 侧面颜色
  wireframe: false,
  side: THREE.DoubleSide,
})

const ellipticalCylinder = new THREE.Mesh(sideGeometry, sideMaterial)
```

### 圆球

&nbsp;&nbsp;&nbsp;&nbsp;如果直接创建一个圆球，看上去像是一个椭圆，为了增加立体感，这里通过创建两个半球和一个圆柱来实现，创建半球是只需要这只不同的开始和结束角度即可，主要参数是thetaStart和thetaLength，代码如下：

```typescript
// 创建底部上半球 S
const solidTopSphere = createSphere({
  radius: 8,
  thetaLength: Math.PI / 2,
  material: new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: false, // 不透明
    opacity: 1,
    side: THREE.DoubleSide,
  }),
  position: new THREE.Vector3(0, 20, 0), // 左侧位置
  rotation: new THREE.Euler(0, 0, 0),
  addToContainer: true,
})

// 创建底部上半球 E

// 创建中间链接圆柱 S
const midCylinderGeometry = new THREE.CylinderGeometry(7, 7, 1, 32)
const midCylinderMaterial = new THREE.MeshBasicMaterial({
  color: 0x1577ff, // 颜色
  opacity: 0.5,
  side: THREE.DoubleSide, // 是否显示半圆的底面
})
const midCylinder = new THREE.Mesh(midCylinderGeometry, midCylinderMaterial)
midCylinder.position.copy(new THREE.Vector3(0, 19.5, 0))
// 创建中间链接圆柱 E

// 创建底部下半球 S
const solidBottomSphere = createSphere({
  radius: 8,
  thetaStart: Math.PI / 2,
  thetaLength: Math.PI / 2,
  material: new THREE.MeshBasicMaterial({
    color: 0xffffff, // 白色
    transparent: false, // 不透明
    opacity: 1,
    side: THREE.DoubleSide, // 是否显示半圆的底面
  }),
  position: new THREE.Vector3(0, 19, 0), // 左侧位置
  rotation: new THREE.Euler(0, 0, 0),
})
// 创建底部下半球 E
```

## 塔身

&nbsp;&nbsp;&nbsp;&nbsp;塔身的主要组成部分是圆柱和球，圆柱是创建底座时的圆柱，设置一个较大的高度即可。圆柱和球都是ThreeJS提供的标准几何体，创建圆球是只需要设置不同的Y坐标即可，这里不在赘述。

## 塔尖

&nbsp;&nbsp;&nbsp;&nbsp;塔尖的主要组成部分是圆球、圆柱、圆锥体，这些都是标准的几何体，创建起来也比较简单。唯一一个可能得难点是塔尖下面有一个相对大的平台，平台上有一些直立的半径很小的圆柱，这里我们假设为8个。这些圆柱的坐标我们可以理解为正八边形中八个点的坐标。类似于计算等边三角形的坐标，我们可以通过计算正八边形中每个点的坐标来得到这些圆柱的坐标。代码如下：

```typescript
/**
 * 拓展：计算正多边形顶点坐标（支持自定义起始角度和圆心偏移，3D 版本）
 * @param radius 外接圆半径（>0）
 * @param sides 边数（≥3）
 * @param startAngle 起始角度（弧度制，默认 0，即 X 轴正方向）
 * @param center 圆心偏移量（默认 (0,0,0)，即原点）
 * @returns 正多边形顶点坐标数组
 */
export function calculateRegularPolygonVertices3DExtended(
  radius: number,
  sides: number,
  startAngle: number = 0,
  center: THREE.Vector3 = new THREE.Vector3(0, 0, 0),
): THREE.Vector3[] {
  // 复用基础校验逻辑
  if (typeof radius !== 'number' || isNaN(radius) || radius <= 0) {
    throw new Error('外接圆半径必须是大于 0 的有效数字')
  }
  if (typeof sides !== 'number' || isNaN(sides) || sides < 3 || !Number.isInteger(sides)) {
    throw new Error('正多边形边数必须是大于或等于 3 的整数')
  }

  const vertices: THREE.Vector3[] = []
  const angleStep = (2 * Math.PI) / sides

  for (let i = 0; i < sides; i++) {
    const currentAngle = startAngle + i * angleStep // 叠加起始角度
    const x = center.x + radius * Math.cos(currentAngle) // 叠加圆心 X 偏移
    const y = center.y + 0 // 保持 Y=0（可自定义修改）
    const z = center.z + radius * Math.sin(currentAngle) // 叠加圆心 Z 偏移
    vertices.push(new THREE.Vector3(x, y, z))
  }

  return vertices
}
```

&nbsp;&nbsp;&nbsp;&nbsp;有了这些坐标，我们就可以创建这些圆柱了。创建一个简单的模型主要的点在于计算坐标，坐标算出来了，剩下的就是使用THREE.js提供的几何体绘制方法像拼积木搭建即可。

## 完整代码
https://stackblitz.com/edit/vitejs-vite-beeexkg8?file=src%2Fcomponents%2Fthree-index.tsx
