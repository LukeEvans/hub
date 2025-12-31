import axios, { AxiosInstance } from 'axios';

export interface HAEntity {
  entity_id: string;
  state: string;
  attributes: Record<string, any>;
  last_changed: string;
  last_updated: string;
  context: any;
}

export interface HAArea {
  area_id: string;
  name: string;
  picture: string | null;
}

export interface HADevice {
  id: string;
  name: string;
  area_id: string | null;
}

export interface HAStateResponse {
  entities: HAEntity[];
  areas: HAArea[];
}

class HomeAssistantClient {
  private client: AxiosInstance | null = null;
  private baseUrl: string;
  private token: string;

  constructor() {
    this.baseUrl = process.env.HOME_ASSISTANT_URL || '';
    this.token = process.env.HOME_ASSISTANT_TOKEN || '';

    console.log('Initializing HomeAssistantClient:');
    console.log(`- Base URL: ${this.baseUrl || 'MISSING'}`);
    console.log(`- Token: ${this.token ? 'PRESENT (starts with ' + this.token.substring(0, 10) + '...)' : 'MISSING'}`);

    if (this.baseUrl && this.token) {
      this.client = axios.create({
        baseURL: `${this.baseUrl.replace(/\/$/, '')}/api`,
        headers: {
          Authorization: `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
      });
    }
  }

  public isConfigured(): boolean {
    return !!this.client;
  }

  public async getStates(): Promise<HAEntity[]> {
    if (!this.client) throw new Error('Home Assistant not configured');
    const response = await this.client.get<HAEntity[]>('/states');
    return response.data;
  }

  public async getAreas(): Promise<HAArea[]> {
    if (!this.client) throw new Error('Home Assistant not configured');
    try {
      const template = `
        [
          {% for area_id in areas() %}
            {
              "area_id": "{{ area_id }}",
              "name": "{{ area_name(area_id) }}",
              "picture": null
            }{% if not loop.last %},{% endif %}
          {% endfor %}
        ]
      `;
      const response = await this.client.post('/template', { template });
      const data = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
      return Array.isArray(data) ? data : [];
    } catch (e: any) {
      console.error('Error fetching HA areas:', e.message);
      return [];
    }
  }

  public async getAreaEntities(): Promise<Record<string, string[]>> {
    if (!this.client) throw new Error('Home Assistant not configured');
    try {
      const template = `
        {
          {% for area_id in areas() %}
            "{{ area_id }}": {{ area_entities(area_id) | to_json }}{% if not loop.last %},{% endif %}
          {% endfor %}
        }
      `;
      const response = await this.client.post('/template', { template });
      const data = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
      return data && typeof data === 'object' ? data : {};
    } catch (e: any) {
      console.error('Error fetching HA area entities:', e.message);
      return {};
    }
  }

  public async callService(domain: string, service: string, data: Record<string, any>): Promise<any> {
    if (!this.client) throw new Error('Home Assistant not configured');
    const response = await this.client.post(`/services/${domain}/${service}`, data);
    return response.data;
  }
}

export const haClient = new HomeAssistantClient();

