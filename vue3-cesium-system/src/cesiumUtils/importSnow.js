import * as Cesium from "cesium"

export default class SnowEffect {
    constructor(viewer, options) {
        if (!viewer) throw new Error("no viewer object")
        options = options || {}
        this.snowSize = Cesium.defaultValue(options.snowSize, 0.02)
        this.snowSpeed = Cesium.defaultValue(options.snowSpeed, 60.0)
        this.viewer = viewer
        this.init()
    }

    init() {
        this.snowStage = new Cesium.PostProcessStage({
            name: 'czm_snow',
            fragmentShader: this.snow(),
            uniforms: {
                snowSize: () => this.snowSize,
                snowSpeed: () => this.snowSpeed
            }
        })
        this.viewer.scene.postProcessStages.add(this.snowStage)
    }

    destroy() {
        if (!this.viewer || !this.snowStage) return
        this.viewer.scene.postProcessStages.remove(this.snowStage)
        this.snowStage.destroy()
        delete this.snowSize
        delete this.snowSpeed
        this.snowStage = null
    }

    show(visible) {
        this.snowStage.enabled = visible
    } 

    snow() {
        return `
            uniform sampler2D colorTexture;
            varying vec2 v_textureCoordinates;
            uniform float snowSpeed;
            uniform float snowSize;
            float snow(vec2 uv, float scale) {
                float time = czm_frameNumber / snowSpeed;
                float w = smoothstep(1.0, 0., -uv.y * (scale / 10.));
                if (w < .1) return 0.0;
                uv +=time / scale; 
                uv.y += time * 2.0 / scale;
                uv.x += sin(uv.y + time * .5) / scale;
                uv *= scale;
                vec2 s = floor(uv), f = fract(uv), p;
                float k = 3., d;
                p = .5 + .35 * sin(11. * fract(sin((s + p + scale) * mat2(7., 3., 6., 5.)) * 5.)) - f;
                d = length(p);
                k = min(d, k);
                k = smoothstep(0., k, sin(f.x + f.y) * snowSize);
                return k * w;
            }
            void main() {
                vec2 resolution = czm_viewport.zw;
                vec2 uv = (gl_FragCoord.xy * 2. - resolution.xy) / min(resolution.x, resolution.y);
                vec3 finalColor = vec3(0);
                float c = 0.;
                c += snow(uv, 30.) * .0;
                c += snow(uv, 20.) * .0;
                c += snow(uv, 15.) * .0;
                c += snow(uv, 10.);
                c += snow(uv, 8.);
                c += snow(uv, 6.);
                c += snow(uv, 5.);
                finalColor = (vec3(c));
                gl_FragColor = mix(texture2D(colorTexture, v_textureCoordinates), vec4(finalColor, 1), .5);
            }
        `
    }
}