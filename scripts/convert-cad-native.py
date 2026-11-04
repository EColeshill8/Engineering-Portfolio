"""Native OpenCascade fallback for STEP tessellation; originals are read-only.

Optional local dependency: cadquery-ocp-novtk==7.8.1.1.post1 in .tools/cad-native.
"""
from pathlib import Path
import sys
root=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(root/'.tools/cad-native'))
from OCP.STEPCAFControl import STEPCAFControl_Reader
from OCP.TDocStd import TDocStd_Document
from OCP.TCollection import TCollection_ExtendedString, TCollection_AsciiString
from OCP.XCAFDoc import XCAFDoc_DocumentTool
from OCP.TDF import TDF_LabelSequence
from OCP.BRepMesh import BRepMesh_IncrementalMesh
from OCP.RWGltf import RWGltf_CafWriter
from OCP.Message import Message_ProgressRange
from OCP.TColStd import TColStd_IndexedDataMapOfStringString
from OCP.IFSelect import IFSelect_RetDone

if '--inspect' in sys.argv:
    for obj in (RWGltf_CafWriter.Perform,RWGltf_CafWriter.__init__,BRepMesh_IncrementalMesh.__init__,STEPCAFControl_Reader.Transfer):
        print(obj.__doc__)
    print(dir(RWGltf_CafWriter))
    sys.exit()

slug=sys.argv[1] if len(sys.argv)>1 else 'baker-bot'
filenames={'baker-bot':'General Assembly - Baker Bot.step','ri3d':'Full Assembly - Ri3D - 2026.step'}
source=root/'Portfolio Content'/filenames[slug]
document=TDocStd_Document(TCollection_ExtendedString('Portfolio CAD'))
reader=STEPCAFControl_Reader();reader.SetColorMode(True);reader.SetNameMode(True)
print(f'Reading {source.name}',flush=True)
if reader.ReadFile(str(source))!=IFSelect_RetDone:raise RuntimeError('STEP read failed')
if not reader.Transfer(document):raise RuntimeError('STEP transfer failed')
shape_tool=XCAFDoc_DocumentTool.ShapeTool_s(document.Main())
roots=TDF_LabelSequence();shape_tool.GetFreeShapes(roots)
tolerance=.18 if slug=='baker-bot' else .2
for i in range(1,roots.Length()+1):
    print(f'Tessellating root {i}/{roots.Length()} at {tolerance} mm',flush=True)
    shape=shape_tool.GetShape_s(roots.Value(i))
    mesher=BRepMesh_IncrementalMesh(shape,tolerance,False,.16,True)
    if not mesher.IsDone():raise RuntimeError('Native tessellation failed')
output=root/'Portfolio Content/Generated CAD'/f'{slug}-native.glb'
writer=RWGltf_CafWriter(TCollection_AsciiString(str(output)),True)
writer.SetMergeFaces(True)
print('Writing glTF with component names and CAD colours',flush=True)
if not writer.Perform(document,TColStd_IndexedDataMapOfStringString(),Message_ProgressRange()):raise RuntimeError('GLB export failed')
print(f'Written {output.name}: {output.stat().st_size:,} bytes',flush=True)
