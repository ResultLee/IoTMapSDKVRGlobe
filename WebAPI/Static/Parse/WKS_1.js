class WKS_1 {
    static GROUP = 1001202;
    // TODO: 判断类型
    static FEATURE = 1000300;
    static FEATURE_POINT = 1000401;
    // TODO: 点图层大数据（服务端计算）
    // static FEATURE_POINT_BIG_SERVER = 1010101;
    // TODO: 点图层大数据（本地计算）
    // static FEATURE_POINT_BIG_LOCAL = 1010102;
    // TODO: 点图层聚合
    // static FEATURE_POINT_BIG_LOCAL = 1010103;
    static FEATURE_POLYLINE = 1000405;
    static FEATURE_POLYGON = 1000404;
    // TODO: 分类图层
    // static FEATURE_CLASSIFICATION = 10104;
    static GRAPHICS = 1000300;
    // TODO: 缓冲区图层
    // static FEATURE_BUFFER = 10104;
    // TODO: 热力图图层
    // static FEATURE_HEATMAP = 10104;
    static IMAGERY = 1000100;
    static IMAGERY_AGMS = 1000111;
    // TODO: BingMap图层
    // static IMAGERY_BM = 10202;
    // TODO: GoogleEarthEnterprise图层
    // static IMAGERY_GEE = 10203;
    // TODO: Grid图层
    // static IMAGERY_GRID = 10204;
    // TODO: Ion图层
    // static IMAGERY_ION = 10205;
    // TODO: Mapbox图层
    // static IMAGERY_MB = 10206;
    // TODO: MapboxStyle图层
    // static IMAGERY_MBS = 10207;
    // TODO: OpenStreetMap图层
    // static IMAGERY_OSM = 10208;
    static IMAGERY_SINGLE = 1000114;
    // TODO: TileCoordinates图层
    // static IMAGERY_TC = 10210;
    // TODO: TileMapService(TMS)图层
    // static IMAGERY_TMS = 10210;
    static IMAGERY_UT = 1000115;
    static IMAGERY_WMS = 1000113;
    static IMAGERY_WMTS = 1000112;
    // TODO: D2C图层
    // static IMAGERY_D2C = 10215;
    static IMAGERY_BD = 1000107;
    static IMAGERY_GD = 1000104;
    static TERRAIN = 103;
    // TODO: ArcGISTiledElevation图层
    static TERRAIN_AGTE = 10301;
    static TERRAIN_CESIUM = 1000202;
    static TERRAIN_ELLIPSOID = 1000201;
    // TODO: GoogleEarthEnterprise图层
    // static TERRAIN_GEE = 10304;
    // TODO: VRTheWorld图层
    // static TERRAIN_VRTW = 10304;
    static TILESET = 1001000;
    static TILESET_SKEW = 1001003;
    static TILESET_BIM = 1001001;
    static TILESET_POINT_CLOUD = 1001002;
    static TILESET_MODEL = 1001001;
    static TILESET_MODEL_BLANK = 1001100;
    static POINT = 1000301;
    static Polygon = 1000304;
    static POLYLINE = 1000302;
    // TODO: Label要素
    // static LABEL = 10501;
    // TODO: BILLBOARD要素
    // static BILLBOARD = 10502;
    // TODO: MARKER要素
    // static MARKER = 10503;
    // TODO: MODEL要素
    // static MODEL = 10504;
    // TODO: 走廊要素
    // static CORRIDOR = 1050502;
    // TODO: 流动线要素
    // static POLYLINE_FLOW = 1050501;
    // TODO: 发光线要素
    // static POLYLINE_POWER = 1050502;
    // TODO: 抛物线要素
    // static POLYLINE_PARABOLA = 1050503;
    // TODO: 管线要素
    // static POLYLINE_VOLUME = 1050504;
    // TODO: RECTANGLE要素
    // static RECTANGLE = 10506;
    // TODO: Circle要素
    // static Circle = 10507;
    // TODO: ScanCircle要素
    // static CIRCLE_SCAN = 1050701;
    // TODO: DiffuseCircle要素
    // static CIRCLE_DIFFUSE = 1050702;
    // TODO: ScanRadarCircle要素
    // static CIRCLE_RADAR = 1050703;
    // TODO: Ellipse要素
    // static ELLIPSE = 10508;
    // TODO: SECTOR要素
    // static SECTOR = 10509;
    // TODO: POLYGON3D要素
    // static POLYGON3D = 10511;
    // TODO: COPLANARPOLYGON要素
    // static COPLANARPOLYGON = 1051001;
    // TODO: BOX要素
    // static BOX = 10512;
    // TODO: CYLINDER要素
    // static CYLINDER = 10513;
    // TODO: SPHERE要素
    // static SPHERE = 10514;
    // TODO: CONE要素
    // static CONE = 10515;
    // TODO: WALL要素
    // static WALL = 10517;
    // TODO: WALL_DYC要素
    // static WALL_DYC = 1051701;
    // TODO: PLOT要素
    // static PLOT = 10518;
    // TODO: PLOT_FORK_ARROW要素
    // static PLOT_FORK_ARROW = 1051801;
    // TODO: PLOT_ARROW_STRAIGHT要素
    // static PLOT_ARROW_STRAIGHT = 1051802;
    // TODO: PLOT_GATHERING_PLACE要素
    // static PLOT_GATHERING_PLACE = 1051803;
    // TODO: PLOT_BESSEL_ARROW要素
    // static PLOT_BESSEL_ARROW = 1051804;
    // TODO: PLOT_PARALLEL_ARROW要素
    // static PLOT_PARALLEL_ARROW = 1051805;
    // TODO: PLOT_POLYLINE_ARROW要素
    // static PLOT_POLYLINE_ARROW = 1051806;
    // TODO: PLOT_POLYLINETRINGLE_ARROW要素
    // static PLOT_POLYLINETRINGLE_ARROW = 1051807;
    // TODO: PLOT_BESSEL_FROK_ARROW要素
    // static PLOT_BESSEL_FROK_ARROW = 1051808;
    // TODO: PLOT_COMPUND_ARROW要素
    // static PLOT_COMPUND_ARROW = 1051809;
    // TODO: PLOT_PINCERATTACK_ARROW要素
    // static PLOT_PINCERATTACK_ARROW = 1051810;
    // TODO: PLOT_DOTTEDLINEFLAT_ARROW要素
    // static PLOT_DOTTEDLINEFLAT_ARROW = 1051811;
    // TODO: PLOT_DOTTEDLINESHARP_ARROW要素
    // static PLOT_DOTTEDLINESHARP_ARROW = 1051812;
    // TODO: 定位
    // static LOCATION = 106;
    // TODO: 飞行
    // static FLY_ROUTE = 10701;
    // TODO: 量算
    // static MEASURE = 10702;
    // TODO: 垂直量算
    // static MEASURE_VERTICAL = 1070201;
    // TODO: 水平量算
    // static MEASURE_HORIZONTAL = 1070202;
    // TODO: 斜距量算
    // static MEASURE_SLOPE = 1070203;
    // TODO: 面积量算
    // static MEASURE_AREA = 1070204;
    // TODO: 可视域
    // static VIEWSHED = 10703;
    // TODO: 二维可视域
    // static VIEWSHED_2D = 1070301;
    // TODO: 三维可视域
    // static VIEWSHED_3D = 1070302;
    // TODO: 通视线
    // static SIGHTLINE = 10704;
    // TODO: 线状通视线
    // static SIGHTLINE_LINE = 1070401;
    // TODO: 圆状通视线
    // static SIGHTLINE_CIRCLE = 1070402;
    // TODO: 挖填体
    // static VOLUME = 10705;
    // TODO: 视频
    // static VIDEO = 10706;
    // TODO: 二维视频
    // static VIDEO_2D = 1070601;
    // TODO: 三维视频
    // static VIDEO_3D = 1070602;
    // TODO: 压平
    // static FLATTEN = 10707;
    // TODO: Water
    // static WATER = 108;
    // TODO: RiverWater
    // static WATER_RIVER = 10801;
    // TODO: LakeWater
    // static WATER_LAKE = 10802;
    // TODO: ReflectWater
    // static WATER_REFLECT = 10803;
    static PARTICLE = 1000600;
    static PARTICLE_FIRE = 1000601;
    static PARTICLE_SMOKE = 1000602;
    static PARTICLE_WATER = 1000603;
    // TODO: 爆炸粒子
    // static PARTICLE_BURST = 10904;
    // TODO: 动态轨迹
    // static DYNAMIC_ROUTE = 110;
    // static ELLIPSOID = 111;
    // TODO: 无类型
    // static NONE = 10001;
    // TODO: 没有量算
    // static NONE = 0;
    // TODO: 水平量算
    // static HORIZONTAL = 1;
    // TODO: 垂直量算
    // static VERTICAL = 2;
    // TODO: 斜距量算
    // static SLOPE = 3;
    // TODO: 面积量算
    // static AREA = 4;

    static transferred(name) {
        return this[name];
    }
}

export default WKS_1;
