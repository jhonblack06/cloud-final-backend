import { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import logo from "./logo.svg";
import "./App.css";
import axios from "axios";
import TextField from "@mui/material/TextField";
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css"; //core css
import "primeicons/primeicons.css";
import { Terminal } from "primereact/terminal";
import { TerminalService } from "primereact/terminalservice";
import { Splitter, SplitterPanel } from "primereact/splitter";
import { InputTextarea } from "primereact/inputtextarea";
import { TabPanel, TabView } from "primereact/tabview";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Accordion, AccordionTab } from "primereact/accordion";

async function sendCode(code, endpoint) {
  try {
    const response = await axios({
      method: "post",
      url: endpoint,
      headers: {},
      data: {
        code: code,
      },
    });
    return response.data[0];
  } catch (err) {
    return { response: "error", body: "Error al realizar la consulta" };
  }
}

function App() {
  const [codeScripts, setcodeScripts] = useState([""]);
  const [activeScript, setActiveScript] = useState("");
  const [codeTitles, setcodeTitles] = useState(["main.py"]);
  const [activeTitle, setActiveTitle] = useState("main.py");
  const [activeTab, setActiveTab] = useState(0);
  const [response, setResponse] = useState("dsadasd\nsadsdas\n");
  const [endpoint, setEndpoint] = useState("http://127.0.0.1:8000/query/");

  const commandHandler = async (text) => {
    switch (text) {
      case "clear":
        TerminalService.emit("clear");
        break;
      default:
        const responseQuery = await sendCode(text, endpoint);
        console.log(responseQuery);
        TerminalService.emit("response", responseQuery.body);
        break;
    }
  };

  const runScript = async () => {
    const responseQuery = await sendCode(activeScript, endpoint);
    setResponse(responseQuery.body);
  };
  const onDelete = (index) => {
    setcodeTitles((previous) => {
      previous.splice(index, 1);
      return previous;
    });
    setcodeScripts((previous) => {
      previous.splice(index, 1);
      return previous;
    });
    setActiveTab((previous) => previous - 1);
  };

  useEffect(() => {
    if (activeTab < 0) {
      setActiveScript(codeScripts[0]);
      setActiveTitle(codeTitles[0]);
      setActiveTab(0);
    } else {
      setActiveScript(codeScripts[activeTab]);
      setActiveTitle(codeTitles[activeTab]);
    }
  }, [activeTab]);
  useEffect(() => {
    setcodeScripts((previous) => {
      console.log(previous);
      previous[activeTab] = activeScript;
      return previous;
    });
  }, [activeScript]);
  useEffect(() => {
    setcodeTitles((previous) => {
      console.log(previous);
      previous[activeTab] = activeTitle;
      return previous;
    });
  }, [activeTitle]);

  useEffect(() => {
    TerminalService.on("command", commandHandler);

    return () => {
      TerminalService.off("command", commandHandler);
    };
  }, []);
  const onTabChange = (e) => {
    if (e.index === codeScripts.length) {
      setcodeScripts((previous) => {
        previous.push("");
        return previous;
      });
      setcodeTitles((previous) => {
        previous.push("new.py");
        return previous;
      });
    }
    setActiveTab(e.index);
  };
  return (
    <div style={{ padding: 16, background: "#FFF" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "space-between",
          background: "#F8F8F8",
        }}
      >
        <h2 style={{ marginLeft: 16, color: "#41BBDB" }}>Cod[E]xecutor</h2>
        <Accordion style={{ width: 700 }}>
          <AccordionTab header="Endpoint for backend">
            <InputText
              value={endpoint}
              onChange={(e) => setEndpoint(e.target.value)}
              style={{ width: 500 }}
            />
          </AccordionTab>
        </Accordion>
      </div>
      <Splitter style={{ height: "700px" }}>
        <SplitterPanel>
          <div className="terminal-demo">
            <div className="card">
              <Terminal
                welcomeMessage="Welcome to Cod[E]xecutor"
                prompt=">>>"
                style={{ height: "690px" }}
              />
            </div>
          </div>
        </SplitterPanel>
        <SplitterPanel>
          <TabView activeIndex={activeTab} onTabChange={onTabChange}>
            {codeScripts.map((value, index) => (
              <TabPanel
                key={`tab-${index}`}
                header={index === activeTab ? activeTitle : codeTitles[index]}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "space-between",
                    background: "#F8F8F8",
                  }}
                >
                  <InputText
                    autoCorrect={false}
                    value={activeTitle}
                    onChange={(e) => setActiveTitle(e.target.value)}
                    style={{ border: 0 }}
                  />
                  {codeTitles.length > 1 && (
                    <Button
                      icon="pi pi-times"
                      className="p-button-rounded p-button-secondary p-button-text"
                      onClick={() => onDelete(index)}
                    />
                  )}
                </div>
                <InputTextarea
                  autoCorrect={false}
                  placeholder="Write your python code"
                  style={{ width: "100%", height: "250px" }}
                  value={activeScript}
                  onChange={(event) => setActiveScript(event.target.value)}
                />
                <Button
                  label="Run Script"
                  className="p-button-success"
                  icon="pi pi-play"
                  onClick={runScript}
                />
                <h4 style={{ paddingLeft: 8 }}>Result:</h4>
                <InputTextarea
                  style={{ width: "100%", height: "200px", border: 0 }}
                  value={response}
                />
              </TabPanel>
            ))}
            <TabPanel key="tab-plus" rightIcon="pi pi-plus" />
          </TabView>
        </SplitterPanel>
      </Splitter>
    </div>
  );
}

export default App;
