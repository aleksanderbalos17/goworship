export interface Event {
  id: string;
  name: string;
  type_id: string;
  date: string;
  time: string;
  duration: string;
  church_id: string;
  location_id: string | null;
  frequency_id: string;
  notes: string;
  created_at: string;
  updated_at: string | null;
  type_name?: string;
  church_name?: string;
  location_name?: string;
  frequency_name?: string;
}

export interface EventType {
  id: string;
  name: string;
  created_at: string;
  updated_at: string | null;
}

export interface EventFrequency {
  id: string;
  name: string;
  active: string;
  notes: string;
  showme: string;
  created_at: string;
  updated_at: string | null;
}

export interface Church {
  id: string;
  name: string;
  photo_url: string | null;
  address: string | null;
  latitude: string | null;
  longitude: string | null;
  created_at: string;
  updated_at: string;
  speakers: string | null;
  denomination_id: string;
  denomination_name?: string;
  locations?: ChurchLocation[];
}

export interface ChurchLocation {
  id: string;
  church_id: string;
  name: string;
  address: string | null;
  latitude: string | null;
  longitude: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface PaginationData {
  current_page: number;
  per_page: number;
  total: number;
  total_pages: number;
  has_next_page: boolean;
  has_prev_page: boolean;
}

export interface EventsApiResponse {
  status: string;
  data: {
    events: Event[];
    pagination: PaginationData;
  };
}

export interface EventFormData {
  name: string;
  eventType: EventType | null;
  date: string;
  time: string;
  duration: string;
  church: Church | null;
  location: ChurchLocation | null;
  frequency: EventFrequency | null;
  notes: string;
}

export interface DeleteModalProps {
  event: Event;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isDeleting: boolean;
}