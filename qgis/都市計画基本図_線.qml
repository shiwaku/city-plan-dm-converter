<!DOCTYPE qgis PUBLIC 'http://mrcc.com/qgis.dtd' 'SYSTEM'>
<!--
  都市計画基本図 線（E2）: 歩道・等高線・建物を分類コードで描き分け
  dm-converter (https://github.com/shiwaku/dm-converter) が生成。
  scripts/make-qgis-styles.js で作り直せる。手で編集した内容は次回生成時に失われる。
-->
<qgis version="3.34.0-Prizren" styleCategories="Symbology|Labeling" labelsEnabled="0">
  <renderer-v2 type="RuleRenderer" forceraster="0" symbollevels="0" enableorderby="0" referencescale="-1">
    <rules key="{00000000-0000-0000-0000-000000000000}">
      <rule key="{00000000-0000-0000-0000-000000000001}" symbol="0" label="歩道" filter="&quot;Code&quot; = '2213'"/>
      <rule key="{00000000-0000-0000-0000-000000000002}" symbol="1" label="等高線" filter="&quot;Code&quot; IN ('7101','7102','7103','7104')"/>
      <rule key="{00000000-0000-0000-0000-000000000003}" symbol="2" label="建物" filter="&quot;Code&quot; IN ('3001','3002','3003','3004')"/>
      <rule key="{00000000-0000-0000-0000-000000000004}" symbol="3" label="その他" filter="ELSE"/>
    </rules>
    <symbols>
    <symbol name="0" type="line" alpha="1" clip_to_extent="1" force_rhr="0" frame_rate="10" is_animated="0">
      <layer class="SimpleLine" enabled="1" locked="0" pass="0">
        <Option type="Map">
          <Option name="capstyle" type="QString" value="square"/>
          <Option name="customdash" type="QString" value="5;2"/>
          <Option name="customdash_unit" type="QString" value="MM"/>
          <Option name="draw_inside_polygon" type="QString" value="0"/>
          <Option name="joinstyle" type="QString" value="bevel"/>
          <Option name="line_color" type="QString" value="0,0,0,255"/>
          <Option name="line_style" type="QString" value="dash"/>
          <Option name="line_width" type="QString" value="0.2"/>
          <Option name="line_width_unit" type="QString" value="MM"/>
          <Option name="offset" type="QString" value="0"/>
          <Option name="offset_unit" type="QString" value="MM"/>
          <Option name="use_custom_dash" type="QString" value="0"/>
        </Option>
      </layer>
    </symbol>
    <symbol name="1" type="line" alpha="1" clip_to_extent="1" force_rhr="0" frame_rate="10" is_animated="0">
      <layer class="SimpleLine" enabled="1" locked="0" pass="0">
        <Option type="Map">
          <Option name="capstyle" type="QString" value="square"/>
          <Option name="customdash" type="QString" value="5;2"/>
          <Option name="customdash_unit" type="QString" value="MM"/>
          <Option name="draw_inside_polygon" type="QString" value="0"/>
          <Option name="joinstyle" type="QString" value="bevel"/>
          <Option name="line_color" type="QString" value="0,0,0,255"/>
          <Option name="line_style" type="QString" value="solid"/>
          <Option name="line_width" type="QString" value="0.15"/>
          <Option name="line_width_unit" type="QString" value="MM"/>
          <Option name="offset" type="QString" value="0"/>
          <Option name="offset_unit" type="QString" value="MM"/>
          <Option name="use_custom_dash" type="QString" value="0"/>
        </Option>
      </layer>
    </symbol>
    <symbol name="2" type="line" alpha="1" clip_to_extent="1" force_rhr="0" frame_rate="10" is_animated="0">
      <layer class="SimpleLine" enabled="1" locked="0" pass="0">
        <Option type="Map">
          <Option name="capstyle" type="QString" value="square"/>
          <Option name="customdash" type="QString" value="5;2"/>
          <Option name="customdash_unit" type="QString" value="MM"/>
          <Option name="draw_inside_polygon" type="QString" value="0"/>
          <Option name="joinstyle" type="QString" value="bevel"/>
          <Option name="line_color" type="QString" value="0,0,0,255"/>
          <Option name="line_style" type="QString" value="solid"/>
          <Option name="line_width" type="QString" value="0.26"/>
          <Option name="line_width_unit" type="QString" value="MM"/>
          <Option name="offset" type="QString" value="0"/>
          <Option name="offset_unit" type="QString" value="MM"/>
          <Option name="use_custom_dash" type="QString" value="0"/>
        </Option>
      </layer>
    </symbol>
    <symbol name="3" type="line" alpha="1" clip_to_extent="1" force_rhr="0" frame_rate="10" is_animated="0">
      <layer class="SimpleLine" enabled="1" locked="0" pass="0">
        <Option type="Map">
          <Option name="capstyle" type="QString" value="square"/>
          <Option name="customdash" type="QString" value="5;2"/>
          <Option name="customdash_unit" type="QString" value="MM"/>
          <Option name="draw_inside_polygon" type="QString" value="0"/>
          <Option name="joinstyle" type="QString" value="bevel"/>
          <Option name="line_color" type="QString" value="0,0,0,255"/>
          <Option name="line_style" type="QString" value="solid"/>
          <Option name="line_width" type="QString" value="0.2"/>
          <Option name="line_width_unit" type="QString" value="MM"/>
          <Option name="offset" type="QString" value="0"/>
          <Option name="offset_unit" type="QString" value="MM"/>
          <Option name="use_custom_dash" type="QString" value="0"/>
        </Option>
      </layer>
    </symbol>
    </symbols>
  </renderer-v2>
</qgis>
