function railingHolder() {
    var railingPoints = [
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(-stepWidth - railingHolderRadius * 1.75, 0, 0),
        new THREE.Vector3(-stepWidth - railingHolderRadius * 1.75, railingHeight, 0)]
    railingPoints.push(railingPoints[railingPoints.length - 1]);
    railingPoints.unshift(railingPoints[0]);

    var curve = new THREE.SplineCurve3(railingPoints);

    var railingHolderGeometry = new THREE.TubeGeometry(curve, 64, railingHolderRadius, 8, false);
    var railingHolderMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });

    var railingHolder = new THREE.Mesh(railingHolderGeometry, railingHolderMaterial);
    railingHolder.castShadow = true;
    railingHolder.receiveShadow = true;

    return railingHolder;
}

function createRailingSupportPoints() {
    var railingPoints = [
        new THREE.Vector3(0, -0.5, 0),
        new THREE.Vector3(-4, -0.5, 0.875),
        new THREE.Vector3(-4, -0.5, 1.125),
        new THREE.Vector3(-4, 2, 1 + depth / 2),
        new THREE.Vector3(-4, 6, 1 + depth / 2)
    ]
    railingPoints.push(railingPoints[railingPoints.length - 1]);

    return railingPoints;
}

function createStair() {
    var shape = new THREE.Shape();
    shape.moveTo(0,-3);
    shape.lineTo(0, 3);
    shape.lineTo(0.1, 3);
    shape.bezierCurveTo(0.1, 0.5, 0.9, 0.2, 2, -2);
    shape.lineTo(2, -3);

    depth = 0;
    var extrudeSettings = {
        steps: 1,
        depth: depth,
        bevelEnabled: true,
        bevelThickness: 0.5,
        bevelSize: 1.5,
        bevelOffset: 0,
        bevelSegments: 2
    };

    var stairGeometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    var stairMaterial = new THREE.MeshLambertMaterial({ color: 0xcc9c59});
    var stair = new THREE.Mesh(stairGeometry, stairMaterial);

    stair.rotation.x = Math.PI/2;
    stair.rotation.z = Math.PI;

    return stair;
}

function createPlaneGeometry() {
    var planeGeometry = new THREE.PlaneGeometry(60,40);
    var planeMaterial =    new THREE.MeshLambertMaterial({color: 0xa0522d});
    var plane = new THREE.Mesh(planeGeometry,planeMaterial);
    plane.receiveShadow  = true;

    plane.rotation.x = -0.5*Math.PI;
    plane.position.x = 15;
    plane.position.y = 0;
    plane.position.z = -10;

    return plane;
}

function createFloor(rotationAngle) {
    var edge = 15;
    var floorGeometry = new THREE.BoxGeometry(edge, edge, 1);
    var floorMaterial = new THREE.MeshLambertMaterial({ color: 0xa0522d});
    var floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.castShadow = true;
    floor.position.x = stepLength + 2;
    floor.rotation.x = -0.5 * Math.PI;
    floor.rotation.z = rotationAngle;

    return floor;
}

function addLightsAndShadows(scene) {
    var spotLight = new THREE.SpotLight( 0xffffff);
    spotLight.position.set( -40, 60, -10 );
    spotLight.castShadow = true;
    scene.add( spotLight );

    var ambientLight = new THREE.AmbientLight(0x000000);
    scene.add(ambientLight);
}

function createStairs(scene, newStairCount, newRotation) {
    
    while (scene.children.length > 0) {
        scene.remove(scene.children[0]);
    }

    var renderer = new THREE.WebGLRenderer();

    renderer.setClearColor(0xEEEEEE, 1.0);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;

    var planeGeometry = createPlaneGeometry();
    scene.add(planeGeometry);

    var stairSupportMaterial = new THREE.MeshPhongMaterial({color: 0xeeeeee});
    var finalRotationAngle = newRotation;
    var stairCount = newStairCount;

    stepLength = 6;
    X = 0;
    Z = 0;
    boxes = [];

    for (i = 0; i < stairCount; i++) {
        var rotationAngle = (Math.PI / 180) * (finalRotationAngle / (stairCount - 1) * i);
        var stair = createStair();
        if(i % 2 == 0) {
            stair.scale.y = -1;
        }
        stair.castShadow = true;
        stair.receiveShadow = true;

        var cylinderHeight = 2.5;
        var cylinderRadius = 0.25;
        var cylinderGeometry = new THREE.CylinderGeometry(cylinderRadius, cylinderRadius, cylinderHeight, 32);
        var cylinderSupport = new THREE.Mesh(cylinderGeometry, stairSupportMaterial);
        cylinderSupport.position.x = 1.7;
        cylinderSupport.position.y = 0.6;
        cylinderSupport.castShadow = true;
        cylinderSupport.receiveShadow = true;

        var cubeHeight = 0.25;
        var cubeLength = 3;
        var cubeGeometry = new THREE.CubeGeometry(cubeLength, cubeHeight, 0.5);
        var cubeSupport = new THREE.Mesh(cubeGeometry, stairSupportMaterial);
        cubeSupport.position.y = -0.5;
        cubeSupport.castShadow = true;
        cubeSupport.receiveShadow = true;

        var boxGeometry = new THREE.BoxGeometry(0, 0, 0);
        var boxMaterial = new THREE.MeshLambertMaterial({ color: 0xff0000 });
        var box = new THREE.Mesh(boxGeometry, boxMaterial);
        box.position.y = 6;
        box.position.z = 4.5;
        box.visible = false;
        boxes.push(box);

        var railingSupportPoints = createRailingSupportPoints();
        var railingHolderGeometry = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(railingSupportPoints), 80, 0.15, 8, false);
        var railingHolder = new THREE.Mesh(railingHolderGeometry, stairSupportMaterial);
        railingHolder.castShadow = true;
        railingHolder.receiveShadow = true;
        railingHolder.position.x = -1.1;
        railingHolder.position.z = 0.5;
        railingHolder.rotation.y = Math.PI/2;

        var step = new THREE.Group();
        step.add(box);
        step.add(railingHolder)
        step.add(stair);
        step.add(cubeSupport);
        if (i != stairCount - 1) {
            step.add(cylinderSupport);
        }

        if (i == stairCount - 1) {
            var floor = createFloor(rotationAngle);
            step.add(floor);
        }

        step.position.x = X;
        step.position.z = Z;
        step.position.y = cubeHeight * 2 + depth + i * (depth + 2);
        var rotationAngle = (Math.PI / 180) * (finalRotationAngle / (stairCount - 1) * i);
        step.rotation.y = rotationAngle;
    
        X = X + stepLength / 2 * Math.cos(rotationAngle);
        Z = Z - stepLength / 2 * Math.sin(rotationAngle);

        scene.add(step);
    }
    scene.updateMatrixWorld();
    var handRailPoints = [];
    for (var i = 0; i < boxes.length; i++) {
        var box = boxes[i];
        var target = new THREE.Vector3();
        box.getWorldPosition(target);
        handRailPoints.push(target);
    }
    var handrailSupportGeometry = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(handRailPoints), 80, 0.2, 8, false);
    var handrail = new THREE.Mesh(handrailSupportGeometry, stairSupportMaterial);
    handrail.castShadow = true;
    handrail.receiveShadow = true;
    scene.add(handrail);

    addLightsAndShadows(scene);   
}

$(function() {
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    var renderer = new THREE.WebGLRenderer();

    renderer.setClearColor(0xEEEEEE, 1.0);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;

    var planeGeometry = createPlaneGeometry();
    scene.add(planeGeometry);

    var controls = new function () {
        this.stairCount = 9;
        this.rotation = 90;
    }
    var gui = new dat.GUI();
    gui.add(controls, 'stairCount', 1, 30).step(3).name("Stair Count").onChange(() => createStairs(scene, controls.stairCount, controls.rotation));
    gui.add(controls, 'rotation', 0, 360).step(1).name("Rotation").onChange(() => createStairs(scene, controls.stairCount, controls.rotation));

    createStairs(scene, controls.stairCount, controls.rotation);

    camera.position.x = -60;
    camera.position.y = 70;
    camera.position.z = 40;
    camera.lookAt(scene.position);
        
    $("#WebGL-output").append(renderer.domElement);
    var trackballControls = new THREE.TrackballControls( camera, renderer.domElement );
    render();

    function render() {
        renderer.render(scene, camera);
        requestAnimationFrame(render);
        trackballControls.update();
    }
});