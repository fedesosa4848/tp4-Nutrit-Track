// Definición de las interfaces para los datos del usuario
export interface DataUser {
    id?:string;
    nombre: string;
    apellido: string;
    email:string;
    password:string;
    edad: number;
    genero: string;
    peso: number; // en kg
    altura: number; // en cm
    perfil: string; // 'volumen' o 'déficit'
    nivelActividad: string; // 'sedentario', 'ligero', 'moderado', 'activo'
}

export interface DataUserNutricional {
    tmb: number; // Tasa Metabólica Basal
    tdee: number; // Total Daily Energy Expenditure
    caloriasObjetivo: number; // calorías objetivo
    macronutrientes: {
        proteinas: number; // en gramos
        carbohidratos: number; // en gramos
        grasas: number; // en gramos
    };
}


export interface User {
    id?:string;
    dataUser: DataUser;
    dataUserNutricional: DataUserNutricional;
}




