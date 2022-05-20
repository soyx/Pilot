#include "runtime/function/render/include/render/vulkan_manager/vulkan_common.h"
#include "runtime/function/render/include/render/vulkan_manager/vulkan_mesh.h"
#include "runtime/function/render/include/render/vulkan_manager/vulkan_misc.h"
#include "runtime/function/render/include/render/vulkan_manager/vulkan_passes.h"
#include "runtime/function/render/include/render/vulkan_manager/vulkan_util.h"

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

        VkDescriptorSetLayoutBinding post_process_global_layout_bindings[2] = {};

        VkDescriptorSetLayoutBinding& post_process_global_layout_input_attachment_binding =
            post_process_global_layout_bindings[0];
        post_process_global_layout_input_attachment_binding.binding         = 0;
        post_process_global_layout_input_attachment_binding.descriptorType  = VK_DESCRIPTOR_TYPE_INPUT_ATTACHMENT;
        post_process_global_layout_input_attachment_binding.descriptorCount = 1;
        post_process_global_layout_input_attachment_binding.stageFlags      = VK_SHADER_STAGE_FRAGMENT_BIT;


    }

    void PScreenSpaceAntialiasingPass::draw() {}
    void PScreenSpaceAntialiasingPass::updateAfterFramebufferRecreate(VkImageView input_attachment) {}
    void PScreenSpaceAntialiasingPass::setupPipelines() {}
    void PScreenSpaceAntialiasingPass::setupDescriptorSet() {}
} // namespace Pilot