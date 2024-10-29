import { User } from "../interfaces/user.interface";

export function calcularTMB(user:User): number {
    const { peso, altura, edad, genero } = user.dataUser;
    let tmb: number;

    // Fórmula de Mifflin-St Joer para TMB
    if (genero === "masculino") {
        tmb = (10 * peso) + (6.25 * altura) - (5 * edad) + 5;
    } else {
        tmb = (10 * peso) + (6.25 * altura) - (5 * edad) - 161;
    }

    user.dataUserNutricional.tmb = tmb;
    return tmb;
}

// Método para calcular el TDEE
export function calcularTDEE(user:User): number {
    const tmb = user.dataUserNutricional.tmb;
    const nivelActividad = user.dataUser.nivelActividad;
    let factorActividad: number;

    // Definir el factor de actividad basado en el nivel de actividad
    switch (nivelActividad) {
        case "sedentario":
            factorActividad = 1.2;
            break;
        case "ligero":
            factorActividad = 1.375;
            break;
        case "moderado":
            factorActividad = 1.55;
            break;
        case "activo":
            factorActividad = 1.725;
            break;
        default:
            factorActividad = 1.2; // Por defecto a sedentario
            break;
    }

    const tdee = tmb * factorActividad;
    user.dataUserNutricional.tdee = tdee;
    return tdee;
}

// Método para calcular las calorías objetivo
export function calcularCaloriasObjetivo(user:User): number {
    const tdee = user.dataUserNutricional.tdee;
    const perfil = user.dataUser.perfil;
    let caloriasObjetivo: number;

    // Ajustar las calorías según el perfil
    if (perfil === "volumen") {
        caloriasObjetivo = tdee * 1.1; // Superávit del 10%
    } else {
        caloriasObjetivo = tdee * 0.9; // Déficit del 10%
    }

    user.dataUserNutricional.caloriasObjetivo = caloriasObjetivo;
    return caloriasObjetivo;
}

// Método para calcular los macronutrientes sugeridos
export function calcularMacronutrientes(user:User): { proteinas: number, grasas: number, carbohidratos: number } {
    const caloriasObjetivo = user.dataUserNutricional.caloriasObjetivo;

    // Volumen:55% carbohidratos , 30% gramosProteinas, 15%gramosGrasas
    // Deficit: 30%carboshidratos, 45% proteinas, 25% grasas


    // Fijar valores para el cálculo de macronutrientes
    const gramosProteinas = 1.925 * user.dataUser.peso; // en gramos
    const caloriasProteinas = gramosProteinas * 4; // 1 gramo de proteína = 4 calorías
    const gramosGrasas = (caloriasObjetivo * 0.25) / 9; // 1 gramo de grasa = 9 calorías
    const caloriasGrasas = gramosGrasas * 9; // Calorías de grasas
    const caloriasRestantes = caloriasObjetivo - (caloriasProteinas + caloriasGrasas);
    const gramosCarbohidratos = caloriasRestantes / 4; // 1 gramo de carbohidrato = 4 calorías

    const macronutrientes = {
        proteinas: Math.round(gramosProteinas),
        grasas: Math.round(gramosGrasas),
        carbohidratos: Math.round(gramosCarbohidratos)
    };

    return macronutrientes;

}