<!DOCTYPE qgis PUBLIC 'http://mrcc.com/qgis.dtd' 'SYSTEM'>
<!--
  都市計画基本図 方向（E6）: 分類コード 12 種を Angle 属性で回転（うち 9 種は地図記号）
  dm-converter (https://github.com/shiwaku/dm-converter) が生成。
  scripts/make-qgis-styles.js で作り直せる。手で編集した内容は次回生成時に失われる。
  埋め込まれている地図記号は smartcity-dm-sprite (https://github.com/geolonia/smartcity-dm-sprite)
  Copyright (c) 2024 Geolonia, Inc. / MIT License
-->
<qgis version="3.34.0-Prizren" styleCategories="Symbology|Labeling" labelsEnabled="0">
  <renderer-v2 type="categorizedSymbol" attr="Code" forceraster="0" symbollevels="0" enableorderby="0" referencescale="-1">
    <categories>
      <category render="true" value="2219" symbol="0" label="2219 道路のトンネル"/>
      <category render="true" value="3401" symbol="1" label="3401 門"/>
      <category render="true" value="4205" symbol="2" label="4205 灯ろう"/>
      <category render="true" value="4207" symbol="3" label="4207 鳥居"/>
      <category render="true" value="4219" symbol="4" label="4219 坑口"/>
      <category render="true" value="5226" symbol="5" label="5226 滝"/>
      <category render="true" value="5227" symbol="6" label="5227 せき"/>
      <category render="true" value="5228" symbol="7" label="5228 水門"/>
      <category render="true" value="5241" symbol="8" label="5241 流水方向"/>
      <category render="true" value="7206" symbol="9" label="7206 洞口"/>
      <category render="true" value="7212" symbol="10" label="7212 露岩"/>
      <category render="true" value="7213" symbol="11" label="7213 散岩"/>
      <category render="true" value="" symbol="12" label="その他"/>
    </categories>
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
          <Option name="size" type="QString" value="3.6"/>
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
    <symbol name="1" type="marker" alpha="1" clip_to_extent="1" force_rhr="0" frame_rate="10" is_animated="0">
      <layer class="SvgMarker" enabled="1" locked="0" pass="0">
        <Option type="Map">
          <Option name="angle" type="QString" value="0"/>
          <Option name="color" type="QString" value="0,0,0,255"/>
          <Option name="fixedAspectRatio" type="QString" value="0"/>
          <Option name="horizontal_anchor_point" type="QString" value="1"/>
          <Option name="name" type="QString" value="base64:PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTM0LjEgMjguOUgyOC45VjM1LjFIMzUuMVYyOC45SDM0LjFaTTM0LjEgMzQuMUgyOS45VjI5LjlIMzQuMVYzNC4xWiIgZmlsbD0iYmxhY2siLz4KPC9zdmc+Cg=="/>
          <Option name="offset" type="QString" value="0,0"/>
          <Option name="offset_unit" type="QString" value="MM"/>
          <Option name="outline_color" type="QString" value="0,0,0,255"/>
          <Option name="outline_width" type="QString" value="0"/>
          <Option name="outline_width_unit" type="QString" value="MM"/>
          <Option name="scale_method" type="QString" value="diameter"/>
          <Option name="size" type="QString" value="9"/>
          <Option name="size_unit" type="QString" value="MM"/>
          <Option name="vertical_anchor_point" type="QString" value="1"/>
        </Option>
        <data_defined_properties>
          <Option type="Map">
            <Option name="name" type="QString" value=""/>
            <Option name="properties" type="Map">
            <Option name="angle" type="Map">
              <Option name="active" type="bool" value="true"/>
              <Option name="expression" type="QString" value="0 - to_real(&quot;Angle&quot;)"/>
              <Option name="type" type="int" value="3"/>
            </Option>
            </Option>
            <Option name="type" type="QString" value="collection"/>
          </Option>
        </data_defined_properties>
      </layer>
    </symbol>
    <symbol name="2" type="marker" alpha="1" clip_to_extent="1" force_rhr="0" frame_rate="10" is_animated="0">
      <layer class="SvgMarker" enabled="1" locked="0" pass="0">
        <Option type="Map">
          <Option name="angle" type="QString" value="0"/>
          <Option name="color" type="QString" value="0,0,0,255"/>
          <Option name="fixedAspectRatio" type="QString" value="0"/>
          <Option name="horizontal_anchor_point" type="QString" value="1"/>
          <Option name="name" type="QString" value="base64:PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTM1LjQ5IDMxLjVDMzUuMjcgMjkuOTYgMzQuMDUgMjguNzQgMzIuNSAyOC41M1YyNS43NEgzMS41VjI4LjUzQzI5Ljk3IDI4Ljc2IDI4Ljc3IDI5Ljk3IDI4LjU1IDMxLjVIMjUuNzRWMzIuNUgyOC41NUMyOC43NyAzNC4wMyAyOS45NyAzNS4yNCAzMS41IDM1LjQ3VjM4LjI2SDMyLjVWMzUuNDdDMzQuMDUgMzUuMjUgMzUuMjYgMzQuMDQgMzUuNDkgMzIuNUgzOC4yNlYzMS41SDM1LjQ5Wk0zMi4wMiAzNC41MkMzMC42MyAzNC41MiAyOS41IDMzLjM5IDI5LjUgMzJDMjkuNSAzMC42MSAzMC42MyAyOS40OCAzMi4wMiAyOS40OEMzMy40MSAyOS40OCAzNC41NCAzMC42MSAzNC41NCAzMkMzNC41NCAzMy4zOSAzMy40MSAzNC41MiAzMi4wMiAzNC41MloiIGZpbGw9ImJsYWNrIi8+Cjwvc3ZnPgo="/>
          <Option name="offset" type="QString" value="0,0"/>
          <Option name="offset_unit" type="QString" value="MM"/>
          <Option name="outline_color" type="QString" value="0,0,0,255"/>
          <Option name="outline_width" type="QString" value="0"/>
          <Option name="outline_width_unit" type="QString" value="MM"/>
          <Option name="scale_method" type="QString" value="diameter"/>
          <Option name="size" type="QString" value="9"/>
          <Option name="size_unit" type="QString" value="MM"/>
          <Option name="vertical_anchor_point" type="QString" value="1"/>
        </Option>
        <data_defined_properties>
          <Option type="Map">
            <Option name="name" type="QString" value=""/>
            <Option name="properties" type="Map">
            <Option name="angle" type="Map">
              <Option name="active" type="bool" value="true"/>
              <Option name="expression" type="QString" value="0 - to_real(&quot;Angle&quot;)"/>
              <Option name="type" type="int" value="3"/>
            </Option>
            </Option>
            <Option name="type" type="QString" value="collection"/>
          </Option>
        </data_defined_properties>
      </layer>
    </symbol>
    <symbol name="3" type="marker" alpha="1" clip_to_extent="1" force_rhr="0" frame_rate="10" is_animated="0">
      <layer class="SvgMarker" enabled="1" locked="0" pass="0">
        <Option type="Map">
          <Option name="angle" type="QString" value="0"/>
          <Option name="color" type="QString" value="0,0,0,255"/>
          <Option name="fixedAspectRatio" type="QString" value="0"/>
          <Option name="horizontal_anchor_point" type="QString" value="1"/>
          <Option name="name" type="QString" value="base64:PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTM4LjkyIDMxLjU5QzM4LjczIDMwLjY4IDM3LjkyIDI5Ljk5IDM2Ljk1IDI5Ljk5QzM1Ljk4IDI5Ljk5IDM1LjE3IDMwLjY4IDM0Ljk4IDMxLjU5SDI5LjA0QzI4Ljg1IDMwLjY4IDI4LjA0IDI5Ljk5IDI3LjA3IDI5Ljk5QzI2LjEgMjkuOTkgMjUuMjkgMzAuNjggMjUuMSAzMS41OUgyMi43MlYzMi41OUgyNS4xNUMyNS40MSAzMy40MSAyNi4xNiAzNC4wMSAyNy4wNiAzNC4wMUMyNy45NiAzNC4wMSAyOC43MiAzMy40MSAyOC45NyAzMi41OUgzNS4wM0MzNS4yOSAzMy40MSAzNi4wNCAzNC4wMSAzNi45NCAzNC4wMUMzNy44NCAzNC4wMSAzOC42IDMzLjQxIDM4Ljg1IDMyLjU5SDQxLjI3VjMxLjU5SDM4LjkxSDM4LjkyWk0yNy4wNyAzMy4yNkMyNi40IDMzLjI2IDI1Ljg3IDMyLjc0IDI1LjgzIDMyLjA4VjMxLjkyQzI1Ljg3IDMxLjI2IDI2LjQxIDMwLjc0IDI3LjA3IDMwLjc0QzI3LjczIDMwLjc0IDI4LjMzIDMxLjMgMjguMzMgMzJDMjguMzMgMzIuNyAyNy43NyAzMy4yNiAyNy4wNyAzMy4yNlpNMzguMTcgMzIuMTdDMzguMDggMzIuNzggMzcuNTggMzMuMjYgMzYuOTQgMzMuMjZDMzYuMjQgMzMuMjYgMzUuNjggMzIuNyAzNS42OCAzMkMzNS42OCAzMS4zIDM2LjI0IDMwLjc0IDM2Ljk0IDMwLjc0QzM3LjU4IDMwLjc0IDM4LjA4IDMxLjIyIDM4LjE3IDMxLjgzVjMyLjE3WiIgZmlsbD0iYmxhY2siLz4KPC9zdmc+Cg=="/>
          <Option name="offset" type="QString" value="0,0"/>
          <Option name="offset_unit" type="QString" value="MM"/>
          <Option name="outline_color" type="QString" value="0,0,0,255"/>
          <Option name="outline_width" type="QString" value="0"/>
          <Option name="outline_width_unit" type="QString" value="MM"/>
          <Option name="scale_method" type="QString" value="diameter"/>
          <Option name="size" type="QString" value="9"/>
          <Option name="size_unit" type="QString" value="MM"/>
          <Option name="vertical_anchor_point" type="QString" value="1"/>
        </Option>
        <data_defined_properties>
          <Option type="Map">
            <Option name="name" type="QString" value=""/>
            <Option name="properties" type="Map">
            <Option name="angle" type="Map">
              <Option name="active" type="bool" value="true"/>
              <Option name="expression" type="QString" value="0 - to_real(&quot;Angle&quot;)"/>
              <Option name="type" type="int" value="3"/>
            </Option>
            </Option>
            <Option name="type" type="QString" value="collection"/>
          </Option>
        </data_defined_properties>
      </layer>
    </symbol>
    <symbol name="4" type="marker" alpha="1" clip_to_extent="1" force_rhr="0" frame_rate="10" is_animated="0">
      <layer class="SvgMarker" enabled="1" locked="0" pass="0">
        <Option type="Map">
          <Option name="angle" type="QString" value="0"/>
          <Option name="color" type="QString" value="0,0,0,255"/>
          <Option name="fixedAspectRatio" type="QString" value="0"/>
          <Option name="horizontal_anchor_point" type="QString" value="1"/>
          <Option name="name" type="QString" value="base64:PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTMyIDI5LjQxQzI5LjE1IDI5LjQxIDI2LjU5IDMxLjIyIDI1LjY0IDMzLjkyTDI2LjU4IDM0LjI1QzI3LjM5IDMxLjk1IDI5LjU3IDMwLjQxIDMyIDMwLjQxQzM0LjQzIDMwLjQxIDM2LjYxIDMxLjk1IDM3LjQyIDM0LjI1TDM4LjM2IDMzLjkyQzM3LjQxIDMxLjIyIDM0Ljg1IDI5LjQxIDMyIDI5LjQxWiIgZmlsbD0iYmxhY2siLz4KPC9zdmc+Cg=="/>
          <Option name="offset" type="QString" value="0,0"/>
          <Option name="offset_unit" type="QString" value="MM"/>
          <Option name="outline_color" type="QString" value="0,0,0,255"/>
          <Option name="outline_width" type="QString" value="0"/>
          <Option name="outline_width_unit" type="QString" value="MM"/>
          <Option name="scale_method" type="QString" value="diameter"/>
          <Option name="size" type="QString" value="9"/>
          <Option name="size_unit" type="QString" value="MM"/>
          <Option name="vertical_anchor_point" type="QString" value="1"/>
        </Option>
        <data_defined_properties>
          <Option type="Map">
            <Option name="name" type="QString" value=""/>
            <Option name="properties" type="Map">
            <Option name="angle" type="Map">
              <Option name="active" type="bool" value="true"/>
              <Option name="expression" type="QString" value="0 - to_real(&quot;Angle&quot;)"/>
              <Option name="type" type="int" value="3"/>
            </Option>
            </Option>
            <Option name="type" type="QString" value="collection"/>
          </Option>
        </data_defined_properties>
      </layer>
    </symbol>
    <symbol name="5" type="marker" alpha="1" clip_to_extent="1" force_rhr="0" frame_rate="10" is_animated="0">
      <layer class="SvgMarker" enabled="1" locked="0" pass="0">
        <Option type="Map">
          <Option name="angle" type="QString" value="0"/>
          <Option name="color" type="QString" value="0,0,0,255"/>
          <Option name="fixedAspectRatio" type="QString" value="0"/>
          <Option name="horizontal_anchor_point" type="QString" value="1"/>
          <Option name="name" type="QString" value="base64:PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTI5LjA2IDMyLjY5QzI4LjE2IDMyLjY5IDI3LjQyIDMzLjQyIDI3LjQyIDM0LjMyQzI3LjQyIDM1LjIyIDI4LjE1IDM1Ljk1IDI5LjA2IDM1Ljk1QzI5Ljk3IDM1Ljk1IDMwLjY5MDEgMzUuMjIgMzAuNjkwMSAzNC4zMkMzMC42OTAxIDMzLjQyIDI5Ljk2IDMyLjY5IDI5LjA2IDMyLjY5Wk0yOS4wNiAzNS4yMUMyOC41NyAzNS4yMSAyOC4xNyAzNC44MSAyOC4xNyAzNC4zM0MyOC4xNyAzMy44NSAyOC41NyAzMy40NSAyOS4wNiAzMy40NUMyOS41NSAzMy40NSAyOS45NDAxIDMzLjg1IDI5Ljk0MDEgMzQuMzNDMjkuOTQwMSAzNC44MSAyOS41NCAzNS4yMSAyOS4wNiAzNS4yMVpNMjcuMyAyNy45MlYyOC45MkgzNi43MDAxVjI3LjkySDI3LjNaTTM0Ljk0IDMyLjY5QzM0LjA0IDMyLjY5IDMzLjMxMDEgMzMuNDIgMzMuMzEwMSAzNC4zMkMzMy4zMTAxIDM1LjIyIDM0LjA0IDM1Ljk1IDM0Ljk0IDM1Ljk1QzM1Ljg0IDM1Ljk1IDM2LjU4MDEgMzUuMjIgMzYuNTgwMSAzNC4zMkMzNi41ODAxIDMzLjQyIDM1Ljg1IDMyLjY5IDM0Ljk0IDMyLjY5Wk0zNC45NCAzNS4yMUMzNC40NSAzNS4yMSAzNC4wNjAxIDM0LjgxIDM0LjA2MDEgMzQuMzNDMzQuMDYwMSAzMy44NSAzNC40NiAzMy40NSAzNC45NCAzMy40NUMzNS40MiAzMy40NSAzNS44MzAxIDMzLjg1IDM1LjgzMDEgMzQuMzNDMzUuODMwMSAzNC44MSAzNS40MyAzNS4yMSAzNC45NCAzNS4yMVoiIGZpbGw9ImJsYWNrIi8+Cjwvc3ZnPgo="/>
          <Option name="offset" type="QString" value="0,0"/>
          <Option name="offset_unit" type="QString" value="MM"/>
          <Option name="outline_color" type="QString" value="0,0,0,255"/>
          <Option name="outline_width" type="QString" value="0"/>
          <Option name="outline_width_unit" type="QString" value="MM"/>
          <Option name="scale_method" type="QString" value="diameter"/>
          <Option name="size" type="QString" value="9"/>
          <Option name="size_unit" type="QString" value="MM"/>
          <Option name="vertical_anchor_point" type="QString" value="1"/>
        </Option>
        <data_defined_properties>
          <Option type="Map">
            <Option name="name" type="QString" value=""/>
            <Option name="properties" type="Map">
            <Option name="angle" type="Map">
              <Option name="active" type="bool" value="true"/>
              <Option name="expression" type="QString" value="0 - to_real(&quot;Angle&quot;)"/>
              <Option name="type" type="int" value="3"/>
            </Option>
            </Option>
            <Option name="type" type="QString" value="collection"/>
          </Option>
        </data_defined_properties>
      </layer>
    </symbol>
    <symbol name="6" type="marker" alpha="1" clip_to_extent="1" force_rhr="0" frame_rate="10" is_animated="0">
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
          <Option name="size" type="QString" value="3.6"/>
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
    <symbol name="7" type="marker" alpha="1" clip_to_extent="1" force_rhr="0" frame_rate="10" is_animated="0">
      <layer class="SvgMarker" enabled="1" locked="0" pass="0">
        <Option type="Map">
          <Option name="angle" type="QString" value="0"/>
          <Option name="color" type="QString" value="0,0,0,255"/>
          <Option name="fixedAspectRatio" type="QString" value="0"/>
          <Option name="horizontal_anchor_point" type="QString" value="1"/>
          <Option name="name" type="QString" value="base64:PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTMzLjkgMjkuNFYzMS41SDMwLjFWMjkuNEgyNC45VjM0LjZIMzAuMVYzMi41SDMzLjlWMzQuNkgzOS4xVjI5LjRIMzMuOVpNMjkuMSAzMy42SDI1LjlWMzAuNEgyOS4xVjMzLjZaTTM4LjEgMzMuNkgzNC45VjMwLjRIMzguMVYzMy42WiIgZmlsbD0iYmxhY2siLz4KPC9zdmc+Cg=="/>
          <Option name="offset" type="QString" value="0,0"/>
          <Option name="offset_unit" type="QString" value="MM"/>
          <Option name="outline_color" type="QString" value="0,0,0,255"/>
          <Option name="outline_width" type="QString" value="0"/>
          <Option name="outline_width_unit" type="QString" value="MM"/>
          <Option name="scale_method" type="QString" value="diameter"/>
          <Option name="size" type="QString" value="9"/>
          <Option name="size_unit" type="QString" value="MM"/>
          <Option name="vertical_anchor_point" type="QString" value="1"/>
        </Option>
        <data_defined_properties>
          <Option type="Map">
            <Option name="name" type="QString" value=""/>
            <Option name="properties" type="Map">
            <Option name="angle" type="Map">
              <Option name="active" type="bool" value="true"/>
              <Option name="expression" type="QString" value="0 - to_real(&quot;Angle&quot;)"/>
              <Option name="type" type="int" value="3"/>
            </Option>
            </Option>
            <Option name="type" type="QString" value="collection"/>
          </Option>
        </data_defined_properties>
      </layer>
    </symbol>
    <symbol name="8" type="marker" alpha="1" clip_to_extent="1" force_rhr="0" frame_rate="10" is_animated="0">
      <layer class="SvgMarker" enabled="1" locked="0" pass="0">
        <Option type="Map">
          <Option name="angle" type="QString" value="0"/>
          <Option name="color" type="QString" value="0,0,0,255"/>
          <Option name="fixedAspectRatio" type="QString" value="0"/>
          <Option name="horizontal_anchor_point" type="QString" value="1"/>
          <Option name="name" type="QString" value="base64:PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTUzLjIyIDMyTDQ1LjE0IDI2Ljk1VjMxLjVIMTAuNzhWMzIuNUg0NS4xNFYzNy4wNUw1My4yMiAzMloiIGZpbGw9ImJsYWNrIi8+Cjwvc3ZnPgo="/>
          <Option name="offset" type="QString" value="0,0"/>
          <Option name="offset_unit" type="QString" value="MM"/>
          <Option name="outline_color" type="QString" value="0,0,0,255"/>
          <Option name="outline_width" type="QString" value="0"/>
          <Option name="outline_width_unit" type="QString" value="MM"/>
          <Option name="scale_method" type="QString" value="diameter"/>
          <Option name="size" type="QString" value="9"/>
          <Option name="size_unit" type="QString" value="MM"/>
          <Option name="vertical_anchor_point" type="QString" value="1"/>
        </Option>
        <data_defined_properties>
          <Option type="Map">
            <Option name="name" type="QString" value=""/>
            <Option name="properties" type="Map">
            <Option name="angle" type="Map">
              <Option name="active" type="bool" value="true"/>
              <Option name="expression" type="QString" value="0 - to_real(&quot;Angle&quot;)"/>
              <Option name="type" type="int" value="3"/>
            </Option>
            </Option>
            <Option name="type" type="QString" value="collection"/>
          </Option>
        </data_defined_properties>
      </layer>
    </symbol>
    <symbol name="9" type="marker" alpha="1" clip_to_extent="1" force_rhr="0" frame_rate="10" is_animated="0">
      <layer class="SvgMarker" enabled="1" locked="0" pass="0">
        <Option type="Map">
          <Option name="angle" type="QString" value="0"/>
          <Option name="color" type="QString" value="0,0,0,255"/>
          <Option name="fixedAspectRatio" type="QString" value="0"/>
          <Option name="horizontal_anchor_point" type="QString" value="1"/>
          <Option name="name" type="QString" value="base64:PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTM0LjU5OTkgMjYuMDJMMzQuNTcgMjYuMDFDMzMuNzggMjUuNjYgMzIuOTIgMjUuNDYgMzIgMjUuNDZDMzEuMDggMjUuNDYgMzAuMjIgMjUuNjYgMjkuNDMgMjYuMDFIMjkuNEMyNy4yMTk5IDI3LjAyIDI1LjcgMjkuMjEgMjUuNyAzMS43NkMyNS43IDMyLjAzIDI1LjczIDMyLjMgMjUuNzYgMzIuNTZIMjYuNzdDMjYuNzMgMzIuMyAyNi43IDMyLjAzIDI2LjcgMzEuNzZDMjYuNyAyOS43OSAyNy44IDI4LjA4IDI5LjQgMjcuMTdWMzIuNTZIMzAuNFYyNi43M0MzMC45MSAyNi41NyAzMS40NCAyNi40NiAzMiAyNi40NkMzMi41NiAyNi40NiAzMy4wODk5IDI2LjU3IDMzLjU5OTkgMjYuNzNWMzIuNTZIMzQuNTk5OVYyNy4xN0MzNi4xOTk5IDI4LjA4IDM3LjI5OTkgMjkuNzkgMzcuMjk5OSAzMS43NkMzNy4yOTk5IDMyLjAzIDM3LjI2OTkgMzIuMyAzNy4yMjk5IDMyLjU2SDM4LjI0QzM4LjI3IDMyLjMgMzguMjk5OSAzMi4wMyAzOC4yOTk5IDMxLjc2QzM4LjI5OTkgMjkuMjEgMzYuNzc5OSAyNy4wMiAzNC41OTk5IDI2LjAzVjI2LjAyWiIgZmlsbD0iYmxhY2siLz4KPC9zdmc+Cg=="/>
          <Option name="offset" type="QString" value="0,0"/>
          <Option name="offset_unit" type="QString" value="MM"/>
          <Option name="outline_color" type="QString" value="0,0,0,255"/>
          <Option name="outline_width" type="QString" value="0"/>
          <Option name="outline_width_unit" type="QString" value="MM"/>
          <Option name="scale_method" type="QString" value="diameter"/>
          <Option name="size" type="QString" value="9"/>
          <Option name="size_unit" type="QString" value="MM"/>
          <Option name="vertical_anchor_point" type="QString" value="1"/>
        </Option>
        <data_defined_properties>
          <Option type="Map">
            <Option name="name" type="QString" value=""/>
            <Option name="properties" type="Map">
            <Option name="angle" type="Map">
              <Option name="active" type="bool" value="true"/>
              <Option name="expression" type="QString" value="0 - to_real(&quot;Angle&quot;)"/>
              <Option name="type" type="int" value="3"/>
            </Option>
            </Option>
            <Option name="type" type="QString" value="collection"/>
          </Option>
        </data_defined_properties>
      </layer>
    </symbol>
    <symbol name="10" type="marker" alpha="1" clip_to_extent="1" force_rhr="0" frame_rate="10" is_animated="0">
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
          <Option name="size" type="QString" value="3.6"/>
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
    <symbol name="11" type="marker" alpha="1" clip_to_extent="1" force_rhr="0" frame_rate="10" is_animated="0">
      <layer class="SvgMarker" enabled="1" locked="0" pass="0">
        <Option type="Map">
          <Option name="angle" type="QString" value="0"/>
          <Option name="color" type="QString" value="0,0,0,255"/>
          <Option name="fixedAspectRatio" type="QString" value="0"/>
          <Option name="horizontal_anchor_point" type="QString" value="1"/>
          <Option name="name" type="QString" value="base64:PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTM2LjIgMjYuNUgyNy44VjI3LjVIMzYuMlYyNi41Wk0yMi44MiAzMy43M0wyNy4zNCA0MC44MUwyOC4xOCA0MC4yN0wyMy42NiAzMy4xOUwyMi44MiAzMy43M1pNNDkuMTkgMzUuMDFDNDguNTMgMzEuNDUgNDYuMTggMjguNSA0Mi44NyAyNy4wNUM0Mi44NyAyNy4wMyA0Mi44NyAyNy4wMSA0Mi44NyAyN0M0Mi44NyAyMSAzNy45OSAxNi4xMiAzMS45OSAxNi4xMkMyNS45OSAxNi4xMiAyMS4xMSAyMSAyMS4xMSAyN0MyMS4xMSAyNy4wMiAyMS4xMSAyNy4wMyAyMS4xMSAyNy4wNUMxNy45NCAyOC40NSAxNS42MiAzMS4yNiAxNC44NyAzNC42NUMxMy41NyA0MC41IDE3LjI4IDQ2LjMyIDIzLjE0IDQ3LjYyQzIzLjkyIDQ3Ljc5IDI0LjcyIDQ3Ljg4IDI1LjUgNDcuODhDMjcuODIgNDcuODggMzAuMDkgNDcuMTMgMzEuOTkgNDUuNzFDMzQuNDIgNDcuNTIgMzcuNDkgNDguMjUgNDAuNDcgNDcuNjlDNDYuMzcgNDYuNiA1MC4yNyA0MC45MSA0OS4xOCAzNS4wMUg0OS4xOVpNNDAuMyA0Ni43MUMzNy40NyA0Ny4yMyAzNC41NiA0Ni41IDMyLjMxIDQ0LjY5TDMyIDQ0LjQ0TDMxLjY5IDQ0LjY5QzI5LjM0IDQ2LjU4IDI2LjMgNDcuMjkgMjMuMzcgNDYuNjRDMTguMDUgNDUuNDYgMTQuNjkgNDAuMTggMTUuODYgMzQuODZDMTYuNTYgMzEuNjggMTguOCAyOS4wNSAyMS44MyAyNy44M0wyMi4xNiAyNy43TDIyLjE0IDI3LjE4QzIyLjE0IDI3LjEyIDIyLjE0IDI3LjA2IDIyLjE0IDI3QzIyLjE0IDIxLjU1IDI2LjU3IDE3LjEyIDMyLjAyIDE3LjEyQzM3LjQ3IDE3LjEyIDQxLjkgMjEuNTUgNDEuOSAyN0M0MS45IDI3LjA3IDQxLjkgMjcuMTMgNDEuOSAyNy4xOUw0MS44OCAyNy43MUw0Mi4yMSAyNy44NEM0NS4zNyAyOS4xMSA0Ny42MyAzMS44NiA0OC4yNSAzNS4yQzQ5LjI0IDQwLjU1IDQ1LjcgNDUuNzIgNDAuMzQgNDYuNzFINDAuM1pNMzUuNzEgNDAuMThMMzYuNTMgNDAuNzVMNDEuMjkgMzMuODNMNDAuNDcgMzMuMjZMMzUuNzEgNDAuMThaIiBmaWxsPSJibGFjayIvPgo8L3N2Zz4K"/>
          <Option name="offset" type="QString" value="0,0"/>
          <Option name="offset_unit" type="QString" value="MM"/>
          <Option name="outline_color" type="QString" value="0,0,0,255"/>
          <Option name="outline_width" type="QString" value="0"/>
          <Option name="outline_width_unit" type="QString" value="MM"/>
          <Option name="scale_method" type="QString" value="diameter"/>
          <Option name="size" type="QString" value="9"/>
          <Option name="size_unit" type="QString" value="MM"/>
          <Option name="vertical_anchor_point" type="QString" value="1"/>
        </Option>
        <data_defined_properties>
          <Option type="Map">
            <Option name="name" type="QString" value=""/>
            <Option name="properties" type="Map">
            <Option name="angle" type="Map">
              <Option name="active" type="bool" value="true"/>
              <Option name="expression" type="QString" value="0 - to_real(&quot;Angle&quot;)"/>
              <Option name="type" type="int" value="3"/>
            </Option>
            </Option>
            <Option name="type" type="QString" value="collection"/>
          </Option>
        </data_defined_properties>
      </layer>
    </symbol>
    <symbol name="12" type="marker" alpha="1" clip_to_extent="1" force_rhr="0" frame_rate="10" is_animated="0">
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
          <Option name="size" type="QString" value="3.6"/>
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
