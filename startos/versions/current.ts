import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '0.1.0-alpha:0',
  releaseNotes: {
    en_US:
      'Initial alpha package built from a pinned public main commit. Includes automatic mainnet Bitcoin/Fulcrum connections, optional Testnet4 with dynamic dependencies, and trusted-network HTTPS access. Browser workspaces require encrypted exports for backup.',
    es_ES:
      'Paquete alfa inicial compilado desde un commit público fijado de main. Incluye conexiones automáticas a Bitcoin/Fulcrum de mainnet, Testnet4 opcional con dependencias dinámicas y acceso HTTPS en redes de confianza. Respalda los espacios del navegador con exportaciones cifradas.',
    de_DE:
      'Erstes Alpha-Paket aus einem festgelegten öffentlichen main-Commit. Mit automatischen Mainnet-Verbindungen zu Bitcoin/Fulcrum, optionalem Testnet4 mit dynamischen Abhängigkeiten und HTTPS-Zugang im vertrauenswürdigen Netzwerk. Browser-Arbeitsbereiche benötigen verschlüsselte Exporte als Sicherung.',
    pl_PL:
      'Pierwszy pakiet alfa z przypiętego publicznego commitu main. Automatyczne połączenia Bitcoin/Fulcrum dla mainnet, opcjonalny Testnet4 z dynamicznymi zależnościami i dostęp HTTPS w zaufanej sieci. Przestrzenie robocze w przeglądarce wymagają zaszyfrowanych eksportów jako kopii zapasowej.',
    fr_FR:
      'Premier paquet alpha construit depuis un commit public main épinglé. Connexions Bitcoin/Fulcrum automatiques pour mainnet, Testnet4 facultatif avec dépendances dynamiques et accès HTTPS sur un réseau de confiance. Les espaces du navigateur nécessitent des exports chiffrés pour leur sauvegarde.',
  },
  migrations: { up: async () => {}, down: IMPOSSIBLE },
})
