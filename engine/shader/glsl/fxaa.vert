#version 310 es

#extension GL_KHR_vulkan_glsl : enable
#extension GL_GOOGLE_include_directive : enable

#include "../include/constants.h"

layout(location = 0) out highp vec2 vUV;

void main()
{
    const vec3 fullscreen_triangle_positions[3] =
        vec3[3](vec3(3.0, 1.0, 0.5), vec3(-1.0, 1.0, 0.5), vec3(-1.0, -3.0, 0.5));
    gl_Position = vec4(fullscreen_triangle_positions[gl_VertexIndex], 1.0);
    vUV = 0.5 * gl_Position.xy + 0.5;
}