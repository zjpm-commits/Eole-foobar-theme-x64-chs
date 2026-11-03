"use strict";

include(`${fb.ComponentPath}\\docs\\Effects.js`);

window.DrawMode = 1;

// 简单的颜色反转着色器
const shaderSource = `
    // 输入纹理（Direct2D 将其传入 t0）
    Texture2D InputTexture : register(t0);
    SamplerState InputSampler : register(s0);

    // Direct2D 输入数据结构
    struct VS_OUTPUT {
        float4 clipSpacePos : SV_POSITION;
        float4 sceneSpacePos : SCENE_POS;
        float4 texelSpacePos : TEXEL_POS;
    };

    // 简单的颜色反转着色器
    float4 main(VS_OUTPUT input) : SV_Target
    {
        // 从输入图像中选取一个像素
        float4 color = InputTexture.Sample(InputSampler, input.texelSpacePos.xy);
	
        // 反转 RGB，保留 alpha
        return float4(1.0 - color.rgb, color.a) * color.a;
    }
`;

const img = d2d.Image(`${fb.ComponentPath}\\samples\\d2d\\images\\Flowers.jpg`);
const effect = d2d.Effect(Effects.CustomShader.ID);
effect.SetInput(0, img);

const shaderCode = d2d.Compile(shaderSource);
if (shaderCode.Error !== "") 
    fb.ShowPopupMessage(shaderCode.Error, "Direct2D 编译错误！");
else
    effect.SetValue(Effects.CustomShader.ShaderCode, shaderCode.Code);

function on_paint(dgr) {	
    dgr.DrawEffect(effect, 10, 10, 0, 0, img.Width, img.Height);
}
