import {type JSX, splitProps } from 'solid-js';

type ButtonVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    isLoading?: boolean;
    leftIcon?: string;
    rightIcon?: string;
    fullWidth?: boolean;
}

const variantStyles = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white',
    success: 'bg-green-600 hover:bg-green-700 text-white',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    warning: 'bg-yellow-500 hover:bg-yellow-600 text-white',
    info: 'bg-blue-400 hover:bg-blue-500 text-white',
};

const sizeStyles = {
    sm: 'py-1 px-3 text-sm',
    md: 'py-2 px-4 text-base',
    lg: 'py-3 px-6 text-lg',
};

export default function Button(props: ButtonProps) {
    const [local, others] = splitProps(props, [
        'variant',
        'size',
        'isLoading',
        'leftIcon',
        'rightIcon',
        'fullWidth',
        'children',
        'class',
    ]);

    const variant = local.variant || 'primary';
    const size = local.size || 'md';

    const classes = [
        'font-medium rounded-lg transition duration-300',
        variantStyles[variant],
        sizeStyles[size],
        local.fullWidth ? 'w-full' : '',
        local.isLoading ? 'opacity-70 cursor-not-allowed' : '',
        local.class || '',
    ].join(' ');

    return (
        <button
            {...others}
            class={classes}
            disabled={local.isLoading || props.disabled}
        >
            {local.isLoading && (
                <span class="mr-2 inline-block animate-spin">
          <i class="fas fa-spinner"></i>
        </span>
            )}

            {local.leftIcon && !local.isLoading && (
                <i class={`fas ${local.leftIcon} mr-2`}></i>
            )}

            {local.children}

            {local.rightIcon && (
                <i class={`fas ${local.rightIcon} ml-2`}></i>
            )}
        </button>
    );
}