import { createSignal, Show, onMount } from 'solid-js';
import { useAuth } from '@stores/authStore';
import { usePets } from '@hooks/usePets';
import { useForm, required } from '@hooks/useForm';
import Button from './Button';
import Input from './Input';

interface AddPetFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

const AddPetForm = (props: AddPetFormProps) => {
    const { user } = useAuth();
    const { createPet } = usePets();
    const [isOpen, setIsOpen] = createSignal(props.isOpen);
    const [errorMessage, setErrorMessage] = createSignal<string | null>(null);

    // Escuchar el evento personalizado para abrir el formulario
    onMount(() => {
        const formContainer = document.querySelector('[data-pet-form]');

        // Escuchar evento de apertura desde otros componentes
        formContainer?.addEventListener('open-pet-form', () => {
            setIsOpen(true);
        });

        // Establecer método global para abrir el formulario
        window.openAddPetForm = () => {
            setIsOpen(true);
        };
    });

    // Definir formulario con validadores
    const { values, errors, isValid, isSubmitting, handleChange, handleSubmit, resetForm } = useForm({
        name: {
            value: '',
            validators: [required('El nombre de la mascota es obligatorio')]
        },
        type: {
            value: 'Perro',
            validators: [required('El tipo de mascota es obligatorio')]
        },
        breed: {
            value: '',
            validators: [required('La raza es obligatoria')]
        },
        age: {
            value: 0,
            validators: [
                (value) => (value < 0 ? 'La edad no puede ser negativa' : null)
            ]
        },
        weight: {
            value: 0,
            validators: [
                (value) => (value < 0 ? 'El peso no puede ser negativo' : null)
            ]
        },
        gender: {
            value: 'Macho',
            validators: [required('El género es obligatorio')]
        }
    });

    const handleClose = () => {
        resetForm();
        setErrorMessage(null);
        props.onClose();
    };

    // Manejar clic fuera del modal
    const handleOverlayClick = (e: MouseEvent) => {
        if ((e.target as HTMLElement).classList.contains('modal-overlay')) {
            handleClose();
        }
    };

    // Procesar envío del formulario
    const handleAddPet = async () => {
        setErrorMessage(null);

        const currentUser = user();
        if (!currentUser) {
            setErrorMessage('Error: No se pudo obtener la información del usuario');
            return;
        }

        try {
            const result = await createPet({
                name: values.name,
                type: values.type,
                breed: values.breed,
                age: Number(values.age),
                weight: Number(values.weight),
                gender: values.gender,
                ownerId: currentUser.id,
                status: 'active'
            });

            if (result.success) {
                handleClose();
                if (props.onSuccess) {
                    props.onSuccess();
                }
            } else {
                setErrorMessage(result.error || 'Error al agregar la mascota');
            }
        } catch (error) {
            setErrorMessage('Error al agregar la mascota');
        }
    };

    return (
        <Show when={isOpen()}>
            <div
                class="modal-overlay fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50"
                onClick={handleOverlayClick}
            >
                <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-2xl font-bold text-gray-800">Agregar mascota</h3>
                        <button onClick={handleClose} class="text-gray-500 hover:text-gray-700">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>

                    <Show when={errorMessage()}>
                        <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                            <span>{errorMessage()}</span>
                        </div>
                    </Show>

                    <form onSubmit={(e) => {
                        e.preventDefault();
                        handleSubmit(handleAddPet);
                    }} class="space-y-4">
                        <Input
                            label="Nombre de la mascota"
                            type="text"
                            id="pet-name"
                            value={values.name}
                            onInput={(e) => handleChange('name', e.currentTarget.value)}
                            error={errors.name}
                            fullWidth
                        />

                        <div>
                            <label for="pet-type" class="block text-sm font-medium text-gray-700">
                                Tipo de mascota
                            </label>
                            <select
                                id="pet-type"
                                value={values.type}
                                onChange={(e) => handleChange('type', e.currentTarget.value)}
                                class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="Perro">Perro</option>
                                <option value="Gato">Gato</option>
                                <option value="Ave">Ave</option>
                                <option value="Roedor">Roedor</option>
                                <option value="Reptil">Reptil</option>
                                <option value="Otro">Otro</option>
                            </select>
                            <Show when={errors.type}>
                                <p class="mt-1 text-sm text-red-600">{errors.type}</p>
                            </Show>
                        </div>

                        <Input
                            label="Raza"
                            type="text"
                            id="pet-breed"
                            value={values.breed}
                            onInput={(e) => handleChange('breed', e.currentTarget.value)}
                            error={errors.breed}
                            fullWidth
                        />

                        <Input
                            label="Edad (años)"
                            type="number"
                            id="pet-age"
                            min="0"
                            max="30"
                            value={values.age}
                            onInput={(e) => handleChange('age', e.currentTarget.valueAsNumber || 0)}
                            error={errors.age}
                            fullWidth
                        />

                        <Input
                            label="Peso (kg)"
                            type="number"
                            id="pet-weight"
                            min="0"
                            step="0.1"
                            value={values.weight}
                            onInput={(e) => handleChange('weight', e.currentTarget.valueAsNumber || 0)}
                            error={errors.weight}
                            fullWidth
                        />

                        <div>
                            <label for="pet-gender" class="block text-sm font-medium text-gray-700">
                                Género
                            </label>
                            <select
                                id="pet-gender"
                                value={values.gender}
                                onChange={(e) => handleChange('gender', e.currentTarget.value)}
                                class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="Macho">Macho</option>
                                <option value="Hembra">Hembra</option>
                            </select>
                            <Show when={errors.gender}>
                                <p class="mt-1 text-sm text-red-600">{errors.gender}</p>
                            </Show>
                        </div>

                        <Button
                            type="submit"
                            variant="success"
                            fullWidth
                            isLoading={isSubmitting()}
                            leftIcon="fa-plus"
                        >
                            Agregar mascota
                        </Button>
                    </form>
                </div>
            </div>
        </Show>
    );
};

export default AddPetForm;