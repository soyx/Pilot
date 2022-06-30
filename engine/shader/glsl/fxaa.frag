#version 310 es

#extension GL_GOOGLE_include_directive : enable
#extension GL_KHR_vulkan_glsl : enable

#include "../include/constants.h"

layout(input_attachment_index = 0, set = 0, binding = 0) uniform highp subpassInput in_color;
layout(set = 0, binding = 1) uniform sampler2D fxaa_render_image_sampler;

layout(location = 0) in highp vec2 vUV;
layout(location = 0) out highp vec4 out_color;

void main()
{
    highp vec4 color       = texture(fxaa_render_image_sampler, vUV);

    out_color = color;
}
