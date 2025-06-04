import { describe, it, expect, vi } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime'; // Using Nuxt Test Utils
import CButton from '~/components/CButton.vue'; // Path to the component

describe('CButton Component', () => {
  it('renders label from default slot', async () => {
    const wrapper = await mountSuspended(CButton, {
      slots: {
        default: 'Slot Label',
      },
    });
    expect(wrapper.text()).toContain('Slot Label');
  });

  it('renders label from prop if no slot is provided', async () => {
    const wrapper = await mountSuspended(CButton, {
      props: {
        label: 'Prop Label',
      },
    });
    expect(wrapper.text()).toContain('Prop Label');
  });

  it('prioritizes slot over prop for label', async () => {
    const wrapper = await mountSuspended(CButton, {
      props: {
        label: 'Prop Label',
      },
      slots: {
        default: 'Slot Label Priority',
      },
    });
    expect(wrapper.text()).toContain('Slot Label Priority');
    expect(wrapper.text()).not.toContain('Prop Label');
  });

  it('applies primary type classes by default', async () => {
    const wrapper = await mountSuspended(CButton);
    // From CButton.vue: primary: "text-xs bg-blue-600 text-white hover:bg-blue-700"
    expect(wrapper.classes()).toContain('bg-blue-600');
    expect(wrapper.classes()).toContain('text-white');
  });

  it('applies secondary type classes when type="secondary"', async () => {
    const wrapper = await mountSuspended(CButton, {
      props: {
        type: 'secondary',
      },
    });
    // From CButton.vue: secondary: "text-xs border border-current text-current hover:bg-gray-600"
    expect(wrapper.classes()).toContain('border-current');
    expect(wrapper.classes()).toContain('text-current');
  });

  it('applies users type classes when type="users"', async () => {
    const wrapper = await mountSuspended(CButton, {
      props: {
        type: 'users',
      },
    });
    // From CButton.vue: users: "text-xs bg-green-600 text-white hover:bg-green-700"
    expect(wrapper.classes()).toContain('bg-green-600');
  });

  it('handles click event', async () => {
    // CButton.vue has `@click="handleClick"`. If handleClick is not defined in script setup,
    // it means native DOM events are emitted. If it were defined and used `defineEmits`,
    // we would test for emitted events using `wrapper.emitted()`.
    // For now, let's test if a click can be simulated and if it would call a mock handler if one was passed.

    const mockClickHandler = vi.fn();
    const wrapper = await mountSuspended(CButton, {
      attrs: { // Native event listeners are passed as attributes
        onClick: mockClickHandler,
      }
    });

    await wrapper.find('button').trigger('click');

    // Check if the mock handler attached to the native click event was called
    expect(mockClickHandler).toHaveBeenCalledTimes(1);
  });

  // Test for default classes if not covered by type classes
  it('applies base classes', async () => {
    const wrapper = await mountSuspended(CButton);
    expect(wrapper.classes()).toContain('inline-flex');
    expect(wrapper.classes()).toContain('items-center');
    expect(wrapper.classes()).toContain('justify-center');
    expect(wrapper.classes()).toContain('rounded');
    expect(wrapper.classes()).toContain('transition-colors');
  });
});
