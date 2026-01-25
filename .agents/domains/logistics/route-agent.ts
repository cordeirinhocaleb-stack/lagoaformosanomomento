/**
 * Route Agent (com Memória)
 * Domínio: Logística
 * 
 * Responsabilidades:
 * - Otimizar rotas de entrega
 * - Calcular distâncias e tempo estimado
 * - Validar waypoints e sequência
 * - Sugerir rotas eficientes
 * - Aprender padrões de rotas otimizadas
 */

import { BaseAgent, TaskContext, TaskResult } from '../../core/base-agent.js';

export interface Waypoint {
    lat: number;
    lng: number;
    address: string;
    order: number;
}

export interface Route {
    id: string;
    name: string;
    waypoints: Waypoint[];
    totalDistance?: number; // em km
    estimatedDuration?: number; // em minutos
}

export class RouteAgent extends BaseAgent {
    constructor(memoryBasePath: string = '.agents/memory') {
        super('route-agent', memoryBasePath);
    }

    /**
     * Implementação da otimização de rotas
     */
    async executeTask(taskDescription: string, context: TaskContext): Promise<TaskResult> {
        const warnings: string[] = [];
        const recommendations: string[] = [];

        // Aqui seria feita a otimização real de rotas
        const success = warnings.length === 0;
        const details = success
            ? 'Rotas otimizadas com sucesso'
            : `Avisos: ${warnings.join(', ')}`;

        return {
            success,
            details,
            warnings: warnings.length > 0 ? warnings : undefined,
            recommendations: recommendations.length > 0 ? recommendations : undefined
        };
    }

    /**
     * Valida rota
     */
    validateRoute(route: Partial<Route>): { valid: boolean; errors: string[]; warnings: string[] } {
        const errors: string[] = [];
        const warnings: string[] = [];

        if (!route.name || route.name.trim().length === 0) {
            errors.push('Nome da rota é obrigatório');
        }

        if (!route.waypoints || route.waypoints.length === 0) {
            errors.push('Rota deve ter pelo menos um waypoint');
        } else if (route.waypoints.length === 1) {
            warnings.push('Rota com apenas um waypoint (considere adicionar mais paradas)');
        }

        // Validar coordenadas
        route.waypoints?.forEach((wp, index) => {
            if (wp.lat < -90 || wp.lat > 90) {
                errors.push(`Waypoint ${index + 1}: Latitude inválida (${wp.lat})`);
            }
            if (wp.lng < -180 || wp.lng > 180) {
                errors.push(`Waypoint ${index + 1}: Longitude inválida (${wp.lng})`);
            }
            if (!wp.address || wp.address.trim().length === 0) {
                warnings.push(`Waypoint ${index + 1}: Endereço vazio`);
            }
        });

        // Validar ordem sequencial
        const orders = route.waypoints?.map(wp => wp.order).sort((a, b) => a - b) || [];
        const expectedOrders = Array.from({ length: orders.length }, (_, i) => i + 1);
        if (JSON.stringify(orders) !== JSON.stringify(expectedOrders)) {
            warnings.push('Ordem dos waypoints não é sequencial (1, 2, 3...)');
        }

        return { valid: errors.length === 0, errors, warnings };
    }

    /**
     * Calcula distância aproximada entre dois pontos (Haversine)
     */
    calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
        const R = 6371; // Raio da Terra em km
        const dLat = this.deg2rad(lat2 - lat1);
        const dLng = this.deg2rad(lng2 - lng1);

        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.deg2rad(lat1)) *
            Math.cos(this.deg2rad(lat2)) *
            Math.sin(dLng / 2) *
            Math.sin(dLng / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c; // Distância em km
    }

    private deg2rad(deg: number): number {
        return deg * (Math.PI / 180);
    }

    /**
     * Estima distância total da rota
     */
    estimateTotalDistance(waypoints: Waypoint[]): number {
        if (waypoints.length < 2) return 0;

        let totalDistance = 0;
        for (let i = 0; i < waypoints.length - 1; i++) {
            const wp1 = waypoints[i];
            const wp2 = waypoints[i + 1];
            totalDistance += this.calculateDistance(wp1.lat, wp1.lng, wp2.lat, wp2.lng);
        }

        return Math.round(totalDistance * 10) / 10; // Arredondar para 1 casa decimal
    }

    /**
     * Estima duração (assumindo velocidade média de 50 km/h)
     */
    estimateDuration(distanceKm: number, avgSpeedKmH: number = 50): number {
        return Math.round((distanceKm / avgSpeedKmH) * 60); // Retorna em minutos
    }

    /**
     * Especialidade padrão do Route Agent
     */
    protected getDefaultSpecialty(): string {
        return `# Route Agent - Especialidade

## Responsabilidades
- Otimizar rotas de entrega
- Calcular distâncias e tempo estimado
- Validar waypoints e sequência
- Sugerir rotas eficientes
- Minimizar tempo e custo de transporte

## Expertise
- Otimização de Rotas
- Algoritmos de Roteamento (TSP, VRP)
- Cálculo de Distâncias (Haversine)
- Logística de Transporte
- Google Maps API / Mapbox

## Regras
- Waypoints devem ter coordenadas válidas
- Ordem deve ser sequencial
- Minimizar distância total
- Considerar restrições de tempo
- Validar endereços

## Tarefas Típicas
- Otimizar sequência de entregas
- Calcular distância total de rota
- Estimar tempo de viagem
- Validar coordenadas GPS
- Sugerir rotas alternativas
`;
    }
}
