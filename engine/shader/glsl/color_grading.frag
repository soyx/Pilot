#version 310 es

#extension GL_GOOGLE_include_directive : enable
#extension GL_KHR_vulkan_glsl : enable

#include "../include/constants.h"

layout(input_attachment_index = 0, set = 0, binding = 0) uniform highp subpassInput in_color;

layout(set = 0, binding = 1) uniform sampler2D color_grading_lut_texture_sampler;

layout(location = 0) out highp vec4 out_color;

void main()
{
    highp ivec2 lut_tex_size = textureSize(color_grading_lut_texture_sampler, 0);
    highp float _COLORS      = float(lut_tex_size.y);

    highp vec4 color       = subpassLoad(in_color).rgba;

    highp float index1 = floor(color.b * _COLORS); // color.b / ( 1 / _COLORS)
    highp float interpo_f = 1.0 - color.b * _COLORS + index1;
    highp vec2 uv1, uv2;
    uv1.x = (index1 + color.r) / _COLORS;
    uv1.y = color.g;
    uv2.x = uv1.x + 1.0 / _COLORS;
    uv2.y = uv1.y;

    highp vec4 color_sample1 = texture(color_grading_lut_texture_sampler, uv1);
    highp vec4 color_sample2 = texture(color_grading_lut_texture_sampler, uv2);

    out_color = interpo_f * color_sample1 + (1.0 - interpo_f) * color_sample2;

//    out_color = color;
}
