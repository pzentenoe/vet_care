import {type JSX, splitProps, Show } from 'solid-js';

interface InputProps extends JSX.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
    leftIcon?: string;
    rightIcon?: string;
    fullWidth?: boolean;
}

export default function Input(props: InputProps) {
    const [local, others] = splitProps(props, [
        'label',
        'error',
        'helperText',
        'leftIcon',
        'rightIcon',
        'fullWidth',
        'class',
    ]);

    const hasError = () => !!local.error;

    const inputClass = () => [
        'block border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-offset-2',
        local.fullWidth ? 'w-full' : '',
        hasError()
            ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
            : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500',
        local.leftIcon ? 'pl-10' : '',
        local.rightIcon ? 'pr-10' : '',
        local.class || '',
    ].join(' ');

    return (
        <div class={local.fullWidth ? 'w-full' : ''}>
            <Show when={local.label}>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                    {local.label}
                </label>
            </Show>

            <div class="relative">
                <Show when={local.leftIcon}>
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <i class={`fas ${local.leftIcon} text-gray-400`}></i>
                    </div>
                </Show>

                <input {...others} class={inputClass()} />

                <Show when={local.rightIcon}>
                    <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <i class={`fas ${local.rightIcon} text-gray-400`}></i>
                    </div>
                </Show>
            </div>

            <Show when={hasError()}>
                <p class="mt-1 text-sm text-red-600">{local.error}</p>
            </Show>

            <Show when={local.helperText && !hasError()}>
                <p class="mt-1 text-sm text-gray-500">{local.helperText}</p>
            </Show>
        </div>
    );
}