// Fonction pour démarrer le scan de code-barres avec ZXing
document.getElementById('scanBtn').addEventListener('click', function() {
    const codeReader = new ZXing.BrowserBarcodeReader();
    codeReader.getVideoInputDevices().then(videoInputDevices => {
        const firstDeviceId = videoInputDevices[0].deviceId;

        // Utiliser la première caméra trouvée (ou arrière sur mobile)
        codeReader.decodeOnceFromVideoDevice(firstDeviceId, 'barcodeScannerArea').then(result => {
            document.getElementById('barcodeResult').innerText = "Code-barres scanné : " + result.text;
            searchCSV(result.text);  // Recherche dans le CSV après le scan
        }).catch(err => console.error(err));
    });
});

// Fonction de recherche dans le CSV pour afficher les résultats formatés
function searchCSV(term) {

    if (!window.csvData || window.csvData.length === 0) {
        document.getElementById('csvResult').innerText = "Veuillez d'abord sélectionner un fichier CSV.";
        return;
    }

    let result = "Aucun résultat trouvé pour : " + term;
    let found = false;
    let resultContent = "";

    for (let i = 1; i < window.csvData.length; i++) {
        let row = window.csvData[i];
        if (row.some(col => col.toString().toLowerCase().includes(term.toLowerCase()))) {
            found = true;
            resultContent = `
                <h3>Résultat trouvé :</h3>
                <p><strong>NOM :</strong> ${row[0]}</p>
                <p><strong>Numéro de série :</strong> ${row[10]}</p>
                <p><strong>Numéro d'inventaire :</strong> ${row[11]}</p>
                <p><strong>Adresse MAC :</strong> ${row[13]}</p>
            `;
            break;
        }
    }

    document.getElementById('csvResult').innerHTML = found ? resultContent : result;
}

// Gestionnaire de la saisie manuelle
document.getElementById('searchBtn').addEventListener('click', function() {
    const searchTerm = document.getElementById('manualBarcode').value;
    if (searchTerm) {
        searchCSV(searchTerm);
    } else {
        alert("Veuillez entrer un terme à rechercher.");
    }
});

// Fonction pour lire le fichier CSV sélectionné ou charger un fichier par défaut
document.getElementById('csvFileInput').addEventListener('change', function(event) {
    let file = event.target.files[0];
    if (file) {
        loadCSV(file);  // Appel de la fonction pour charger le fichier CSV
    }
});

// Fonction pour charger un fichier CSV
function loadCSV(file) {
    console.log("Chargement du fichier CSV :", file);  // Vérification que le fichier est bien passé à PapaParse

    Papa.parse(file, {
        complete: function(results) {
            if (results.data.length > 0) {
                window.csvData = results.data;  // Stocker les données CSV dans une variable globale
                document.getElementById('barcodeResult').innerText = "Fichier CSV chargé avec succès.";
            } else {
                document.getElementById('barcodeResult').innerText = "Erreur : Les données CSV sont vides.";
            }
        },
        error: function(error) {
            document.getElementById('barcodeResult').innerText = "Erreur lors du chargement du CSV.";
        },
        header: false  // Désactiver l'option d'en-tête pour conserver toutes les lignes
    });
}

// Charger un fichier CSV par défaut (glpi.csv) si aucun fichier n'est fourni
window.onload = function() {
    fetch('glpi.csv')
        .then(response => response.text())
        .then(csvText => {
            Papa.parse(csvText, {
                complete: function(results) {
                    console.log("CSV par défaut chargé :", results.data);
                    if (results.data.length > 0) {
                        window.csvData = results.data;
                        document.getElementById('barcodeResult').innerText = "Fichier glpi.csv par défaut chargé.";
                    } else {
                        document.getElementById('barcodeResult').innerText = "Erreur : Les données CSV par défaut sont vides.";
                    }
                },
                error: function(error) {
                    console.error("Erreur lors du chargement du CSV par défaut :", error);
                },
                header: false  // Désactiver l'option d'en-tête pour conserver toutes les lignes
            });
        })
        .catch(error => console.error("Erreur lors de la récupération du fichier CSV par défaut :", error));
};
