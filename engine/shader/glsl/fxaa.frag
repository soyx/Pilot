#version 310 es

#extension GL_GOOGLE_include_directive : enable
#extension GL_KHR_vulkan_glsl : enable

#include "../include/constants.h"

precision mediump float;

layout(input_attachment_index = 0, set = 0, binding = 0) uniform highp subpassInput in_color;
layout(set = 0, binding = 1) uniform sampler2D fxaa_render_image_sampler;

layout(location = 0) in highp vec2 vUV;
layout(location = 0) out highp vec4 out_color;

#define FXAA_EDGE_THRESHOLD 0.125
#define FXAA_EDGE_THRESHOLD_MIN 0.0625
#define EDGE_STEP_COUNT_MAX 12
#define GRADIENT_SCALE 0.25

float fxaaLuma(vec3 rgb)
{
    return dot(vec3(0.299, 0.587, 0.114), rgb);
}

float stepPixelCount(int index)
{
    if(index < 5)
        return 1.0;
    else if(index == 5)
        return 1.5;
    else if(index < 10)
        return 2.0;
    else if(index == 10)
        return 4.0;
    else if(index == 11)
        return 8.0;
}


void main()
{
    vec3 rgbN = textureLodOffset(fxaa_render_image_sampler, vUV, 0.0, ivec2(0, -1)).rgb;
    vec3 rgbS = textureLodOffset(fxaa_render_image_sampler, vUV, 0.0, ivec2(0, 1)).rgb;
    vec3 rgbM = textureLodOffset(fxaa_render_image_sampler, vUV, 0.0, ivec2(0, 0)).rgb;
    vec3 rgbE = textureLodOffset(fxaa_render_image_sampler, vUV, 0.0, ivec2(1, 0)).rgb;
    vec3 rgbW = textureLodOffset(fxaa_render_image_sampler, vUV, 0.0, ivec2(-1, 0)).rgb;
    
    vec3 rgbNE = textureLodOffset(fxaa_render_image_sampler, vUV, 0.0, ivec2(1, -1)).rgb;
    vec3 rgbNW = textureLodOffset(fxaa_render_image_sampler, vUV, 0.0, ivec2(-1, -1)).rgb;
    vec3 rgbSE = textureLodOffset(fxaa_render_image_sampler, vUV, 0.0, ivec2(1, 1)).rgb;
    vec3 rgbSW = textureLodOffset(fxaa_render_image_sampler, vUV, 0.0, ivec2(-1, 1)).rgb;
    
    float lumaN = fxaaLuma(rgbN);
    float lumaS = fxaaLuma(rgbS);
    float lumaM = fxaaLuma(rgbM);
    float lumaE = fxaaLuma(rgbE);
    float lumaW = fxaaLuma(rgbW);
    
    float lumaNE = fxaaLuma(rgbNE);
    float lumaNW = fxaaLuma(rgbNW);
    float lumaSE = fxaaLuma(rgbSE);
    float lumaSW = fxaaLuma(rgbSW);

    float range_min = min(lumaM, min(min(lumaN, lumaS),min(lumaE, lumaW)));
    float range_max = max(lumaM, max(max(lumaN, lumaS),max(lumaE, lumaW)));
    float range = range_max - range_min;
    float range_max_scaled = range_max * FXAA_EDGE_THRESHOLD;
    float range_max_clamped = max(FXAA_EDGE_THRESHOLD_MIN, range_max_scaled);
    
    vec3 out_color_rgb;
    
    bool early_exit = range < range_max_clamped;
    if(early_exit)
    {
        out_color_rgb = rgbM;
        out_color = vec4(out_color_rgb, 1.0);
        return;
    }
    
    float luma_gradientN = lumaN - lumaM;
    float luma_gradientS = lumaS - lumaM;
    float luma_gradientE = lumaE - lumaM;
    float luma_gradientW = lumaW - lumaM;
    
    float luma_gradientNE = lumaNE - lumaE;
    float luma_gradientNW = lumaNW - lumaW;
    float luma_gradientSE = lumaSE - lumaE;
    float luma_gradientSW = lumaS;
    
    float luma_gradientV = abs(lumaNE + lumaSE - 2.0 * lumaE)
                            + 2.0 * abs(lumaN + lumaS - 2.0 * lumaM)
                            + abs(lumaNW + lumaSW - 2.0 * lumaW);
    float luma_gradientH = abs(lumaNE + lumaNW - 2.0 * lumaN)
                            + 2.0 * abs(lumaE + lumaW - 2.0 * lumaM)
                            + abs(lumaSE + lumaSW - 2.0 * lumaS);
    
    bool is_horz = luma_gradientV > luma_gradientH;
    
    vec2 start_pos;
    vec2 step_normal;
    
    ivec2 texture_size = textureSize(fxaa_render_image_sampler, 0);
    vec2 uv_step = vec2(1.0 / float(texture_size.x), 1.0 / float(texture_size.y));
    
    if(is_horz)
    {
        start_pos = vUV + vec2(0.0, 0.5 * uv_step.y);
        step_normal = vec2(0.0, uv_step.y);
    }
    else
    {
        start_pos = vUV + vec2(0.5 * uv_step.x, 0.0);
    }
    
    float luma_start = fxaaLuma(texture(fxaa_render_image_sampler, start_pos).rgb);
    
    float gradient;
    
    if(is_horz)
    {
        gradient = abs(luma_gradientN) > abs(luma_gradientS) ? luma_gradientN : luma_gradientS;
    }
    else
    {
        gradient = abs(luma_gradientE) > abs(luma_gradientW) ? luma_gradientE : luma_gradientW;
    }
    
    
    vec2 pos_endP;
    vec2 pos_endN;
    float luma_endP;
    float luma_endN;
    for(int i = 0; i < EDGE_STEP_COUNT_MAX; i++)
    {
        pos_endP = vUV + stepPixelCount(i) * step_normal;
        vec3 rgb_endP = texture(fxaa_render_image_sampler, pos_endP).rgb;
        luma_endP = fxaaLuma(rgb_endP);
        if(abs(luma_endP - luma_start) > abs(gradient) * GRADIENT_SCALE)
        {
            break;
        }
    }
    
    for(int i = 0; i < EDGE_STEP_COUNT_MAX; i++)
    {
        pos_endN = vUV - stepPixelCount(i) * step_normal;
        
        vec3 rgb_endN = texture(fxaa_render_image_sampler, pos_endN).rgb;
        luma_endN = fxaaLuma(rgb_endN);
        if(abs(luma_endN - luma_start) > abs(gradient) * GRADIENT_SCALE)
        {
            break;
        }
    }
    
    float length_pos = max(abs(pos_endP - start_pos).x, abs(pos_endP - start_pos).y);
    float length_neg = max(abs(pos_endN - start_pos).x, abs(pos_endN - start_pos).y);
    
    bool is_pos_near = length_pos < length_neg;
    float luma_end_near = is_pos_near ? luma_endP : luma_endN;
    float length_near = is_pos_near ? length_pos : length_neg;
    
    float blend;
    if((lumaM - luma_start) * (luma_end_near - luma_start) > 0.0)
    {
        blend = 0.0;
    }
    else
    {
        blend = abs(0.5 - length_near / (length_pos + length_neg));
    }
    
    out_color_rgb = blend * (rgbM + gradient) + (1.0 - blend) * rgbM;
    
    // float pixel_offset = -1.0 * (is_pos_near ? length_pos : length_neg) / (length_pos + length_neg) + 0.5;
    
    
    // highp vec3 out_color_rgb = localContractCheck(FXAA_EDGE_THRESHOLD, FXAA_EDGE_THRESHOLD_MIN);

    out_color = vec4(out_color_rgb, 1.0);
}
