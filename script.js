document.addEventListener('DOMContentLoaded', () => {
    const itemListContainer = document.getElementById('item-list');
    const classeSelect = document.getElementById('filter-classe');
    const tipoSelect = document.getElementById('filter-tipo');
    const nomeSelect = document.getElementById('filter-nome');
    let allItems = [];

    // Função para carregar os dados do arquivo JSON
    const fetchItems = async () => {
        try {
            const response = await fetch('dados.json');
            if (!response.ok) {
                throw new Error('Não foi possível carregar o arquivo dados.json');
            }
            allItems = await response.json();
            
            // Popula as listas ao carregar os dados
            populateSelect(classeSelect, [...new Set(allItems.map(item => item.classe))]);
            populateSelect(tipoSelect, [...new Set(allItems.map(item => item.tipo))]);
            populateSelect(nomeSelect, [...new Set(allItems.map(item => item.nome))]);
            
            displayItems(allItems);
        } catch (error) {
            console.error('Erro ao buscar os itens:', error);
            itemListContainer.innerHTML = '<p>Erro ao carregar os dados. Por favor, verifique se o arquivo dados.json está correto.</p>';
        }
    };

    // Função genérica para preencher qualquer select
    const populateSelect = (selectElement, itemsArray) => {
        const selectedValue = selectElement.value;
        const defaultOption = selectElement.querySelector('option[value=""]').cloneNode(true);
        selectElement.innerHTML = '';
        selectElement.appendChild(defaultOption);

        itemsArray.sort().forEach(item => {
            const option = document.createElement('option');
            option.value = item;
            option.textContent = item;
            selectElement.appendChild(option);
        });
        selectElement.value = selectedValue;
    };

    // Função para renderizar os itens na página
    const displayItems = (items) => {
        itemListContainer.innerHTML = '';
        if (items.length === 0) {
            itemListContainer.innerHTML = '<p>Nenhum item encontrado com os filtros selecionados.</p>';
            return;
        }

        items.forEach(item => {
            const itemCard = document.createElement('div');
            itemCard.classList.add('item-card');
            itemCard.innerHTML = `
                <h3>${item.nome}</h3>
                <p><strong>Preço Médio:</strong> ${item.precoMedio} Zen</p>
                <p><strong>Classe:</strong> ${item.classe}</p>
                <p><strong>Tipo:</strong> ${item.tipo}</p>
            `;
            itemListContainer.appendChild(itemCard);
        });
    };

    // Função principal de filtragem que atua em cascata
    const filterItems = () => {
        const selectedClasse = classeSelect.value;
        const selectedTipo = tipoSelect.value;
        const selectedNome = nomeSelect.value;

        let filteredItems = allItems.filter(item => {
            const matchesClasse = selectedClasse === '' || item.classe === selectedClasse;
            const matchesTipo = selectedTipo === '' || item.tipo === selectedTipo;
            const matchesNome = selectedNome === '' || item.nome === selectedNome;
            return matchesClasse && matchesTipo && matchesNome;
        });

        const currentClasseValue = classeSelect.value;
        const currentTipoValue = tipoSelect.value;
        const currentNomeValue = nomeSelect.value;

        const availableClasses = [...new Set(filteredItems.map(item => item.classe))];
        const availableTypes = [...new Set(filteredItems.map(item => item.tipo))];
        const availableNames = [...new Set(filteredItems.map(item => item.nome))];
        
        // Popula as listas suspensas
        populateSelect(classeSelect, availableClasses);
        populateSelect(tipoSelect, availableTypes);
        populateSelect(nomeSelect, availableNames);
        
        // Mantém o valor selecionado
        classeSelect.value = currentClasseValue;
        tipoSelect.value = currentTipoValue;
        nomeSelect.value = currentNomeValue;
        
        displayItems(filteredItems);
    };

    // Eventos de mudança para cada select
    classeSelect.addEventListener('change', filterItems);
    tipoSelect.addEventListener('change', filterItems);
    nomeSelect.addEventListener('change', filterItems);

    // Inicia o processo carregando os itens
    fetchItems();
});
