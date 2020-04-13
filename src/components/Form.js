import React, { useState, useEffect } from 'react';
import axios from 'axios';
import InputMask from 'react-input-mask';
import Select from 'react-select';
import FileSaver from 'file-saver';

import './styles.css';

export default () => {
  const [items, setItems] = useState([{}]);
  const [nomeEleitor, setNomeEleitor] = useState('');
  const [inscricaoEleitoral, setInscricaoEleitoral] = useState('');
  const [nomePartido, setNomePartido] = useState('');
  const [siglaPartido, setSiglaPartido] = useState('');
  const [municipio, setMunicipio] = useState('');
  const [presidentePartido, setPresidente] = useState('');

  useEffect(() => {
    async function loadData() {
      const response = await axios.get(
        'https://servicodados.ibge.gov.br/api/v1/localidades/estados/42/municipios'
      );
      const newitems = response.data.map((item) => {
        return { value: item.nome, label: item.nome };
      });
      setItems(newitems);
    }
    loadData();
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();

    if (isAllValidate()) {
      const obj = {
        nomeEleitor: nomeEleitor,
        inscricaoEleitoral: inscricaoEleitoral,
        nomePartido: nomePartido,
        siglaPartido: siglaPartido,
        municipio: municipio.value,
        presidentePartido: presidentePartido,
        nomePartidoUpper: nomePartido.toUpperCase(),
        minicipioUpper: municipio.value.toUpperCase(),
      };
      const time = new Date().valueOf();
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/download`,
        {
          data: { obj: obj, time: time },
        }
      );

      if (response.status === 200) {
        const responsePdf = await axios.get(
          `${process.env.REACT_APP_API_URL}/fetch-pdf?url=${time}`,
          { responseType: 'blob' }
        );

        const blob = new Blob([responsePdf.data], {
          type: 'application/pdf',
        });

        FileSaver.saveAs(blob, 'requerimento.pdf');
      }
    } else {
      alert(
        'Erro ao gerar o seu requerimento, tenha certeza que todos os campos estão preenchidos corretamente!'
      );
    }
  }

  function isAllValidate() {
    let isValidate = true;

    if (inscricaoEleitoral.replace(/\D+/g, '').length < 12) isValidate = false;
    if (municipio.length <= 0) isValidate = false;

    return isValidate;
  }

  return (
    <div className="container">
      <div className="formulario">
        <h2>Requerimento de desfiliação partidária</h2>
        <form onSubmit={handleSubmit}>
          <label>
            Nome do eleitor <i>*</i>
          </label>
          <input
            type="text"
            className="inputField"
            placeholder="Nome do eleitor"
            value={nomeEleitor}
            onChange={(requerimento) =>
              setNomeEleitor(requerimento.target.value)
            }
            required
          />
          <label>
            Inscrição eleitoral <i>*</i>
          </label>
          <InputMask
            mask="9999 9999 9999"
            className="inputField"
            placeholder="Inscrição eleitoral"
            value={inscricaoEleitoral}
            onChange={(requerimento) =>
              setInscricaoEleitoral(requerimento.target.value)
            }
            required
          />
          <label>
            Nome do partido<i>*</i>
          </label>
          <input
            type="text"
            className="inputField"
            placeholder="Nome do partido"
            value={nomePartido}
            onChange={(requerimento) =>
              setNomePartido(requerimento.target.value)
            }
            required
          />
          <label>
            Sigla do partido <i>*</i>
          </label>
          <input
            type="text"
            className="inputField"
            placeholder="Sigla do partido"
            value={siglaPartido}
            onChange={(requerimento) =>
              setSiglaPartido(requerimento.target.value)
            }
            required
          />
          <label>
            Municipio <i>*</i>
          </label>
          <Select
            options={items}
            className="selectComponent"
            placeholder="Selecione um municipio"
            isSearchable
            onChange={setMunicipio}
            required={true}
          />
          <label>
            Presidente do partido <i>*</i>
          </label>
          <input
            type="text"
            className="inputField"
            placeholder="Presidente do partido"
            value={presidentePartido}
            onChange={(requerimento) =>
              setPresidente(requerimento.target.value)
            }
            required
          />
          <button className="button">Cadastrar</button>
        </form>
      </div>
    </div>
  );
};
