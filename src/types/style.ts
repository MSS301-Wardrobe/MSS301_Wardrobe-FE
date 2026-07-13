export interface StylePreference {
  preferenceId?: string;
  favoriteColors: string[];
  preferredStyles: string[];
  lifestyles: string[];
  clothingInterests: string[];
  updatedAt?: string;
}

export interface SaveStylePreferenceRequest {
  favoriteColors: string[];
  preferredStyles: string[];
  lifestyles: string[];
  clothingInterests: string[];
}