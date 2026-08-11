<!DOCTYPE qgis PUBLIC 'http://mrcc.com/qgis.dtd' 'SYSTEM'>
<!--
  都市計画基本図 注記（E7）: Text をラベル表示し Angle / Vnflag で向きを再現
  dm-converter (https://github.com/shiwaku/dm-converter) が生成。
  scripts/make-qgis-styles.js で作り直せる。手で編集した内容は次回生成時に失われる。
-->
<qgis version="3.34.0-Prizren" styleCategories="Symbology|Labeling" labelsEnabled="1">
  <renderer-v2 type="singleSymbol" forceraster="0" symbollevels="0" enableorderby="0" referencescale="-1">
    <symbols>
    <symbol name="0" type="marker" alpha="1" clip_to_extent="1" force_rhr="0" frame_rate="10" is_animated="0">
      <layer class="SimpleMarker" enabled="1" locked="0" pass="0">
        <Option type="Map">
          <Option name="angle" type="QString" value="0"/>
          <Option name="cap_style" type="QString" value="square"/>
          <Option name="color" type="QString" value="120,120,120,255"/>
          <Option name="horizontal_anchor_point" type="QString" value="1"/>
          <Option name="joinstyle" type="QString" value="bevel"/>
          <Option name="name" type="QString" value="circle"/>
          <Option name="offset" type="QString" value="0,0"/>
          <Option name="offset_unit" type="QString" value="MM"/>
          <Option name="outline_color" type="QString" value="35,35,35,255"/>
          <Option name="outline_style" type="QString" value="solid"/>
          <Option name="outline_width" type="QString" value="0"/>
          <Option name="outline_width_unit" type="QString" value="MM"/>
          <Option name="scale_method" type="QString" value="diameter"/>
          <Option name="size" type="QString" value="0.8"/>
          <Option name="size_unit" type="QString" value="MM"/>
          <Option name="vertical_anchor_point" type="QString" value="1"/>
        </Option>
      </layer>
    </symbol>
    </symbols>
  </renderer-v2>
  <labeling type="simple">
    <settings calloutType="simple">
      <text-style fieldName="Text" isExpression="0" fontSize="7" fontSizeUnit="Point" textColor="0,0,0,255"
                  textOrientation="horizontal" multilineHeight="1" allowHtml="0" blendMode="0" fontStrikeout="0"
                  fontUnderline="0" fontItalic="0" fontWeight="50" textOpacity="1">
        <text-buffer bufferDraw="1" bufferSize="0.8" bufferSizeUnits="MM" bufferColor="255,255,255,255"
                     bufferOpacity="1" bufferJoinStyle="128" bufferNoFill="0" bufferBlendMode="0"/>
        <background shapeDraw="0"/>
        <shadow shadowDraw="0"/>
      </text-style>
      <text-format placeDirectionSymbol="0" multilineAlign="1" wrapChar="" useMaxLineLengthForAutoWrap="1"
                   autoWrapLength="0" decimals="3" formatNumbers="0" plussign="0" addDirectionSymbol="0"/>
      <placement placement="1" offsetType="0" quadOffset="4" xOffset="0" yOffset="0" offsetUnits="MM"
                 rotationAngle="0" preserveRotation="1" dist="0" distUnits="MM" priority="5"
                 overlapHandling="PreventOverlap"/>
      <rendering drawLabels="1" scaleVisibility="1" scaleMin="2500" scaleMax="0"
                 fontMinPixelSize="3" fontMaxPixelSize="10000" displayAll="0" upsidedownLabels="0"
                 labelPerPart="0" mergeLines="0" obstacle="1" obstacleFactor="1"/>
      <data_defined_properties>
        <Option type="Map">
          <Option name="name" type="QString" value=""/>
          <Option name="properties" type="Map">
          <Option name="LabelRotation" type="Map">
            <Option name="active" type="bool" value="true"/>
            <Option name="expression" type="QString" value="CASE WHEN abs(to_real(&quot;Angle&quot;)) = 90 THEN 0 ELSE to_real(&quot;Angle&quot;) END"/>
            <Option name="type" type="int" value="3"/>
          </Option>
          <Option name="TextOrientation" type="Map">
            <Option name="active" type="bool" value="true"/>
            <Option name="expression" type="QString" value="CASE WHEN &quot;Vnflag&quot; = '1' THEN 'vertical' ELSE 'horizontal' END"/>
            <Option name="type" type="int" value="3"/>
          </Option>
          </Option>
          <Option name="type" type="QString" value="collection"/>
        </Option>
      </data_defined_properties>
    </settings>
  </labeling>
</qgis>
