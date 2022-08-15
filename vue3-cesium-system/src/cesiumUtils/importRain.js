import * as Cesium from "cesium"

export default class RainEffect {
    constructor(viewer, options) {
        if (!viewer) throw new Error("no viewer object!")
        options = options || {}
        //倾斜角度，负数向右，正数向左
        this.tiltAngle = Cesium.defaultValue(options.tiltAngle, 0.6)
        this.rainSize = Cesium.defaultValue(options.rainSize, 0.3)
        this.rainSpeed= Cesium.defaultValue(options.rainSpeed, 30.0)
        this.viewer = viewer
        this.init()
    }

    init() {
        this.rainStage = new Cesium.PostProcessStage({
            name: 'czm_rain',
            fragmentShader: this.rain(),
            uniforms: {
                tiltAngle: () => this.tiltAngle,
                rainSize: () => this.rainSize,
                rainSpeed: () => this.rainSpeed
            }
            //模糊效果
            // textureScale: 0.1
        })
        this.viewer.scene.postProcessStages.add(this.rainStage)
    }

    destroy() {
        if (!this.viewer || !this.rainStage) return
        this.viewer.scene.postProcessStages.remove(this.rainStage)
        this.rainStage.destroy()
        delete this.tiltAngle
        delete this.rainSize
        delete this.rainSpeed
        this.rainStage = null
    }

    show(visible) {
        this.rainStage.enabled = visible
    }

    rain() {
        return `
            uniform sampler2D colorTexture;
            varying vec2 v_textureCoordinates;
            uniform float tiltAngle;
            uniform float rainSpeed;
            uniform float rainSize;
            float hash(float x) {
                return fract(sin(x * 133.3) * 13.13);
            }
            void main() {
                float time = czm_frameNumber / rainSpeed;
                vec2 resolution = czm_viewport.zw;
                vec2 uv = (gl_FragCoord.xy * 2.0 - resolution.xy) / min(resolution.x, resolution.y);
                vec3 c = vec3(.6, .7, .8);
                float a = tiltAngle;
                float si = sin(a), co = cos(a);
                uv *= mat2(co, -si, si, co);
                uv *= length(uv + vec2(0., 4.9)) * rainSize + 1.;
                float v = 1. - sin(hash(floor(uv.x * 100.)) * 2.);
                float b = clamp(abs(sin(20. * time * v + uv.y * (5. / (2. + v)))) - .95, 0., 1.) * 20.;
                c *= v * b;
                gl_FragColor = mix(texture2D(colorTexture, v_textureCoordinates), vec4(c, 1), .5);
            }
        `
    }
}