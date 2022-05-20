#include "runtime/function/render/include/render/vulkan_manager/vulkan_common.h"
#include "runtime/function/render/include/render/vulkan_manager/vulkan_mesh.h"
#include "runtime/function/render/include/render/vulkan_manager/vulkan_misc.h"
#include "runtime/function/render/include/render/vulkan_manager/vulkan_passes.h"
#include "runtime/function/render/include/render/vulkan_manager/vulkan_util.h"

#include <post_process_vert.h>

namespace Pilot
{
    void PScreenSpaceAntialiasingPass::initialize(VkRenderPass render_pass, VkImageView input_attachment)
    {
        _framebuffer.render_pass = render_pass;
        setupDescriptorSetLayout();
        setupPipelines();
        setupDescriptorSet();
        updateAfterFramebufferRecreate(input_attachment);
    }
    void PScreenSpaceAntialiasingPass::setupDescriptorSetLayout()
    {
        _descriptor_infos.resize(1);

        VkDescriptorSetLayoutBinding post_process_global_layout_bindings[1] = {};

        VkDescriptorSetLayoutBinding& post_process_global_layout_input_attachment_binding =
            post_process_global_layout_bindings[0];
        post_process_global_layout_input_attachment_binding.binding         = 0;
        post_process_global_layout_input_attachment_binding.descriptorType  = VK_DESCRIPTOR_TYPE_INPUT_ATTACHMENT;
        post_process_global_layout_input_attachment_binding.descriptorCount = 1;
        post_process_global_layout_input_attachment_binding.stageFlags      = VK_SHADER_STAGE_FRAGMENT_BIT;

        VkDescriptorSetLayoutCreateInfo post_process_global_layout_create_info {};
        post_process_global_layout_create_info.sType = VK_STRUCTURE_TYPE_DESCRIPTOR_SET_LAYOUT_CREATE_INFO;
        post_process_global_layout_create_info.flags = 0;
        post_process_global_layout_create_info.bindingCount =
            sizeof(post_process_global_layout_bindings) / sizeof(post_process_global_layout_bindings[0]);
        post_process_global_layout_create_info.pBindings = post_process_global_layout_bindings;
        
        if (VK_SUCCESS != vkCreateDescriptorSetLayout(m_p_vulkan_context->_device, &post_process_global_layout_create_info, nullptr, &_descriptor_infos[0].layout))
        {
            throw std::runtime_error("create post process global layout error");
        }

    }

    void PScreenSpaceAntialiasingPass::setupPipelines() 
    {
        _render_pipelines.resize(1);
        VkDescriptorSetLayout descriptorset_layouts[1] = {_descriptor_infos[0].layout};
        VkPipelineLayoutCreateInfo pipeline_layout_create_info {};
        pipeline_layout_create_info.sType = VK_STRUCTURE_TYPE_PIPELINE_LAYOUT_CREATE_INFO;
        pipeline_layout_create_info.setLayoutCount = 1;
        pipeline_layout_create_info.pSetLayouts    = descriptorset_layouts;

        if (vkCreatePipelineLayout(m_p_vulkan_context->_device, &pipeline_layout_create_info, nullptr, &_render_pipelines[0].layout) != VK_SUCCESS)
        {
            throw std::runtime_error("create post process pipeline layout error");
        }

        VkShaderModule vert_shader_module =
            PVulkanUtil::createShaderModule(m_p_vulkan_context->_device, POST_PROCESS_VERT);
        //VkShaderModule frag_shader_module = PVulkanUtil::createShaderModule(m_p_vulkan_context->_device, )
    }
    void PScreenSpaceAntialiasingPass::draw() {}
    void PScreenSpaceAntialiasingPass::updateAfterFramebufferRecreate(VkImageView input_attachment) {}
    void PScreenSpaceAntialiasingPass::setupDescriptorSet() {}
} // namespace Pilot