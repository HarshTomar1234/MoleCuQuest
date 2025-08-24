"use client";
import React, { Component } from "react";
import _ from "lodash";
import PropTypes from "prop-types";
import initRDKitModule from "@rdkit/rdkit";

const initRDKit = (() => {
  let rdkitLoadingPromise;
  return () => {
    if (!rdkitLoadingPromise) {
      rdkitLoadingPromise = new Promise((resolve, reject) => {
        // Configure WASM path
        const wasmPath = '/_next/static/chunks/app/model/RDKit_minimal.wasm';
        
        initRDKitModule({
          locateFile: (file) => {
            if (file.endsWith('.wasm')) {
              return wasmPath;
            }
            return file;
          }
        })
          .then((RDKit) => {
            console.log('✅ RDKit loaded successfully');
            resolve(RDKit);
          })
          .catch((e) => {
            console.error('❌ RDKit loading failed:', e);
            reject(e);
          });
      });
    }
    return rdkitLoadingPromise;
  };
})();

class MoleculeStructure extends Component {
  static propTypes = {
    id: PropTypes.string.isRequired,
    className: PropTypes.string,
    svgMode: PropTypes.bool,
    width: PropTypes.number,
    height: PropTypes.number,
    structure: PropTypes.string.isRequired,
    subStructure: PropTypes.string,
    extraDetails: PropTypes.object,
    drawingDelay: PropTypes.number,
    scores: PropTypes.number,
  };

  static defaultProps = {
    subStructure: "",
    className: "",
    width: 250,
    height: 200,
    svgMode: false,
    extraDetails: {},
    drawingDelay: undefined,
    scores: 0,
  };

  constructor(props) {
    super(props);

    this.MOL_DETAILS = {
      width: this.props.width,
      height: this.props.height,
      bondLineWidth: 1,
      addStereoAnnotation: true,
      ...this.props.extraDetails,
    };

    this.state = {
      svg: undefined,
      rdKitLoaded: false,
      rdKitError: false,
    };
  }

  drawOnce = (() => {
    let wasCalled = false;

    return () => {
      if (!wasCalled) {
        wasCalled = true;
        this.draw();
      }
    };
  })();

  draw() {
    if (this.props.drawingDelay) {
      setTimeout(() => {
        this.drawSVGorCanvas();
      }, this.props.drawingDelay);
    } else {
      this.drawSVGorCanvas();
    }
  }

  drawSVGorCanvas() {
    const mol = this.RDKit.get_mol(this.props.structure || "invalid");
    const qmol = this.RDKit.get_qmol(this.props.subStructure || "invalid");
    const isValidMol = this.isValidMol(mol);

    if (this.props.svgMode && isValidMol) {
      const svg = mol.get_svg_with_highlights(this.getMolDetails(mol, qmol));
      this.setState({ svg });
    } else if (isValidMol) {
      const canvas = document.getElementById(this.props.id);
      mol.draw_to_canvas_with_highlights(canvas, this.getMolDetails(mol, qmol));
    }

    mol?.delete();
    qmol?.delete();
  }

  isValidMol(mol) {
    return !!mol;
  }

  getMolDetails(mol, qmol) {
    if (this.isValidMol(mol) && this.isValidMol(qmol)) {
      const subStructHighlightDetails = JSON.parse(
        mol.get_substruct_matches(qmol),
      );
      const subStructHighlightDetailsMerged = !_.isEmpty(
        subStructHighlightDetails,
      )
        ? subStructHighlightDetails.reduce(
            (acc, { atoms, bonds }) => ({
              atoms: [...acc.atoms, ...atoms],
              bonds: [...acc.bonds, ...bonds],
            }),
            { bonds: [], atoms: [] },
          )
        : subStructHighlightDetails;
      return JSON.stringify({
        ...this.MOL_DETAILS,
        ...(this.props.extraDetails || {}),
        ...subStructHighlightDetailsMerged,
      });
    } else {
      return JSON.stringify({
        ...this.MOL_DETAILS,
        ...(this.props.extraDetails || {}),
      });
    }
  }

  componentDidMount() {
    initRDKit()
      .then((RDKit) => {
        this.RDKit = RDKit;
        this.setState({ rdKitLoaded: true });
        try {
          this.draw();
        } catch (err) {
          console.log(err);
        }
      })
      .catch((err) => {
        console.log(err);
        this.setState({ rdKitError: true });
      });
  }

  componentDidUpdate(prevProps) {
    if (
      !this.state.rdKitError &&
      this.state.rdKitLoaded &&
      !this.props.svgMode
    ) {
      this.drawOnce();
    }

    if (this.state.rdKitLoaded) {
      const shouldUpdateDrawing =
        prevProps.structure !== this.props.structure ||
        prevProps.svgMode !== this.props.svgMode ||
        prevProps.subStructure !== this.props.subStructure ||
        prevProps.width !== this.props.width ||
        prevProps.height !== this.props.height ||
        !_.isEqual(prevProps.extraDetails, this.props.extraDetails);

      if (shouldUpdateDrawing) {
        this.draw();
      }
    }
  }

  render() {
    console.log("props score number:", this.props.scores);
    if (this.state.rdKitError) {
      return (
        <div className="flex items-center justify-center bg-red-50 dark:bg-red-900/20 border-2 border-dashed border-red-300 dark:border-red-600 rounded-lg p-4" 
             style={{ width: this.props.width, height: this.props.height }}>
          <div className="text-center">
            <div className="text-red-600 dark:text-red-400 text-sm font-medium">
              Error loading renderer
            </div>
            <div className="text-red-500 dark:text-red-300 text-xs mt-1">
              RDKit failed to initialize
            </div>
          </div>
        </div>
      );
    }
    if (!this.state.rdKitLoaded) {
      return (
        <div className="flex items-center justify-center bg-blue-50 dark:bg-blue-900/20 border-2 border-dashed border-blue-300 dark:border-blue-600 rounded-lg p-4" 
             style={{ width: this.props.width, height: this.props.height }}>
          <div className="text-center">
            <div className="text-blue-600 dark:text-blue-400 text-sm font-medium">
              Loading renderer...
            </div>
            <div className="text-blue-500 dark:text-blue-300 text-xs mt-1">
              Initializing RDKit
            </div>
          </div>
        </div>
      );
    }

    const mol = this.RDKit.get_mol(this.props.structure || "invalid");
    const isValidMol = this.isValidMol(mol);
    mol?.delete();

    if (!isValidMol) {
      return (
        <div className="flex items-center justify-center bg-gray-100 dark:bg-gray-700 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4" 
             style={{ width: this.props.width, height: this.props.height }}>
          <div className="text-center">
            <div className="text-red-500 text-sm font-medium">
              Unable to render structure
            </div>
            <div className="text-gray-500 dark:text-gray-400 text-xs mt-1" title={this.props.structure}>
              Invalid SMILES format
            </div>
          </div>
        </div>
      );
    } else if (this.props.svgMode) {
      return (
        <div
          title={this.props.structure}
          className={"molecule-structure-svg " + (this.props.className || "")}
          style={{ width: this.props.width, height: this.props.height }}
          dangerouslySetInnerHTML={{ __html: this.state.svg }}
        ></div>
      );
    } else {
      return (
        <div
          className={
            "molecule-canvas-container " + (this.props.className || "")
          }
        >
          <canvas
            title={this.props.structure}
            id={this.props.id}
            width={this.props.width}
            height={this.props.height}
          ></canvas>
          {this.props.scores ? (
            <p className="text-red-600 z-50 p-10">
              Score: {this.props.scores.toFixed(2)}
            </p>
          ) : (
            ""
          )}
        </div>
      );
    }
  }
}

export default MoleculeStructure;
