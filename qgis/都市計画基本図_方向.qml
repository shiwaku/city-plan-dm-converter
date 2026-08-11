<!DOCTYPE qgis PUBLIC 'http://mrcc.com/qgis.dtd' 'SYSTEM'>
<!--
  都市計画基本図 方向（E6）: Angle 属性で記号を回転
  dm-converter (https://github.com/shiwaku/dm-converter) が生成。
  scripts/make-qgis-styles.js で作り直せる。手で編集した内容は次回生成時に失われる。
-->
<qgis version="3.34.0-Prizren" styleCategories="Symbology|Labeling" labelsEnabled="0">
  <renderer-v2 type="singleSymbol" forceraster="0" symbollevels="0" enableorderby="0" referencescale="-1">
    <symbols>
    <symbol name="0" type="marker" alpha="1" clip_to_extent="1" force_rhr="0" frame_rate="10" is_animated="0">
      <layer class="SimpleMarker" enabled="1" locked="0" pass="0">
        <Option type="Map">
          <Option name="angle" type="QString" value="0"/>
          <Option name="cap_style" type="QString" value="square"/>
          <Option name="color" type="QString" value="227,26,28,255"/>
          <Option name="horizontal_anchor_point" type="QString" value="1"/>
          <Option name="joinstyle" type="QString" value="bevel"/>
          <Option name="name" type="QString" value="triangle"/>
          <Option name="offset" type="QString" value="0,0"/>
          <Option name="offset_unit" type="QString" value="MM"/>
          <Option name="outline_color" type="QString" value="35,35,35,255"/>
          <Option name="outline_style" type="QString" value="solid"/>
          <Option name="outline_width" type="QString" value="0.2"/>
          <Option name="outline_width_unit" type="QString" value="MM"/>
          <Option name="scale_method" type="QString" value="diameter"/>
          <Option name="size" type="QString" value="3.0"/>
          <Option name="size_unit" type="QString" value="MM"/>
          <Option name="vertical_anchor_point" type="QString" value="1"/>
        </Option>
      <data_defined_properties>
        <Option type="Map">
          <Option name="name" type="QString" value=""/>
          <Option name="properties" type="Map">
          <Option name="angle" type="Map">
            <Option name="active" type="bool" value="true"/>
            <Option name="expression" type="QString" value="90 - to_real(&quot;Angle&quot;)"/>
            <Option name="type" type="int" value="3"/>
          </Option>
          </Option>
          <Option name="type" type="QString" value="collection"/>
        </Option>
      </data_defined_properties>
      </layer>
    </symbol>
    </symbols>
  </renderer-v2>
</qgis>
