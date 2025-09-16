document.addEventListener('DOMContentLoaded', () => {
    const itemListContainer = document.getElementById('item-list');
    const classeSelect = document.getElementById('filter-classe');
    const tipoSelect = document.getElementById('filter-tipo');
    const nomeSelect = document.getElementById('filter-nome');
    const adicionaisSelect = document.getElementById('filter-adicionais');
    const nivelSelect = document.getElementById('filter-nivel');
    let allItems = [];

    const fetchItems = async () => {
        try {
            const response = await fetch('dados.json');
            if (!response.ok) {
                throw new Error('Não foi possível carregar o arquivo dados.json');
            }
            allItems = await response.json();
            
            populateFilters(allItems);
            displayItems(allItems);
        } catch (error) {
            console.error('Erro ao buscar os itens:', error);
            itemListContainer.innerHTML = '<p>Erro ao carregar os dados. Por favor, verifique se o arquivo dados.json está formatado corretamente.</p>';
        }
    };

    const populateSelect = (selectElement, itemsArray) => {
        const selectedValue = selectElement.value;
        const defaultOption = selectElement.querySelector('option[value=""]').cloneNode(true);
        selectElement.innerHTML = '';
        selectElement.appendChild(defaultOption);

        itemsArray.sort((a, b) => {
            if (a.startsWith('+') && b.startsWith('+')) {
                return parseInt(a.substring(1)) - parseInt(b.substring(1));
            }
            return a.localeCompare(b);
        }).forEach(item => {
            const option = document.createElement('option');
            option.value = item;
            option.textContent = item;
            selectElement.appendChild(option);
        });
        selectElement.value = selectedValue;
    };

    const populateFilters = (items) => {
        const uniqueClasses = [...new Set(items.map(item => item.classe))];
        const uniqueTipos = [...new Set(items.map(item => item.tipo))];
        const uniqueNomes = [...new Set(items.map(item => item.nome))];
        const uniqueAdicionais = [...new Set(items.flatMap(item => item.adicionais))];
        const uniqueNiveis = [...new Set(items.flatMap(item => item.nivel))];
        
        populateSelect(classeSelect, uniqueClasses);
        populateSelect(tipoSelect, uniqueTipos);
        populateSelect(nomeSelect, uniqueNomes);
        populateSelect(adicionaisSelect, uniqueAdicionais);
        populateSelect(nivelSelect, uniqueNiveis);
    };

    const displayItems = (items) => {
        itemListContainer.innerHTML = '';
        if (items.length === 0) {
            itemListContainer.innerHTML = '<p>Nenhum item encontrado com os filtros selecionados.</p>';
            return;
        }

        items.forEach(item => {
            const itemCard = document.createElement('div');
            itemCard.classList.add('item-card');
            
            const adicionais = item.adicionais.length > 0 ? `<p><strong>Adicionais:</strong> ${item.adicionais.join(', ')}</p>` : '';
            const nivel = item.nivel.length > 0 ? `<p><strong>Nível:</strong> ${item.nivel.join(', ')}</p>` : '';

            itemCard.innerHTML = `
                <h3>${item.nome}</h3>
                <p><strong>Preço Médio:</strong> R$ ${item.precoMedio}</p>
                <p><strong>Classe:</strong> ${item.classe}</p>
                <p><strong>Tipo:</strong> ${item.tipo}</p>
                ${adicionais}
                ${nivel}
            `;
            itemListContainer.appendChild(itemCard);
        });
    };

    const filterItems = () => {
        const selectedClasse = classeSelect.value;
        const selectedTipo = tipoSelect.value;
        const selectedNome = nomeSelect.value;
        const selectedAdicional = adicionaisSelect.value;
        const selectedNivel = nivelSelect.value;

        let filteredItems = allItems.filter(item => {
            const matchesClasse = selectedClasse === '' || item.classe === selectedClasse;
            const matchesTipo = selectedTipo === '' || item.tipo === selectedTipo;
            const matchesNome = selectedNome === '' || item.nome === selectedNome;
            const matchesAdicional = selectedAdicional === '' || item.adicionais.includes(selectedAdicional);
            const matchesNivel = selectedNivel === '' || item.nivel.includes(selectedNivel);
            return matchesClasse && matchesTipo && matchesNome && matchesAdicional && matchesNivel;
        });

        populateFilters(filteredItems);
        
        classeSelect.value = selectedClasse;
        tipoSelect.value = selectedTipo;
        nomeSelect.value = selectedNome;
        adicionaisSelect.value = selectedAdicional;
        nivelSelect.value = selectedNivel;
        
        displayItems(filteredItems);
    };

    classeSelect.addEventListener('change', filterItems);
    tipoSelect.addEventListener('change', filterItems);
    nomeSelect.addEventListener('change', filterItems);
    adicionaisSelect.addEventListener('change', filterItems);
    nivelSelect.addEventListener('change', filterItems);

    fetchItems();
});
